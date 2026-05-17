import type { User } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/prisma";
import { assertTransition, reservationTransitions } from "@/lib/permissions/transitions";
import { reservationRepository } from "@/server/repositories/reservation-repository";
import { writeAuditLog } from "@/server/services/audit-service";
import { createNotification, createNotifications } from "@/server/services/notification-service";

export async function createReservation(user: User, resourceId: string, pickupDate: Date) {
  if (!["STUDENT", "TEACHER", "DEPARTMENT_HEAD", "LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "This role cannot create reservations", 403);
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  });

  if (!resource || resource.status !== "APPROVED") {
    throw new AppError("RESOURCE_NOT_AVAILABLE", "Resource is not available for reservation", 400);
  }

  const reservation = await prisma.$transaction(async (tx) => {
    const copy = await tx.bookCopy.findFirst({
      where: {
        resourceId,
        status: "AVAILABLE"
      },
      orderBy: { createdAt: "asc" }
    });

    if (!copy) {
      throw new AppError("COPY_NOT_AVAILABLE", "No available copy for this resource", 409);
    }

    await tx.bookCopy.update({
      where: { id: copy.id },
      data: {
        status: "RESERVED"
      }
    });

    return tx.reservation.create({
      data: {
        userId: user.id,
        resourceId,
        copyId: copy.id,
        pickupDate,
        pickupDeadline: new Date(pickupDate.getTime() + 1000 * 60 * 60 * 24),
        qrCode: `${resourceId}:${copy.id}:${user.id}`
      },
      include: {
        resource: true,
        copy: true
      }
    });
  });

  await writeAuditLog({
    userId: user.id,
    action: "CREATE_RESERVATION",
    entity: "Reservation",
    entityId: reservation.id,
    newValue: { status: reservation.status, resourceId }
  });

  await createNotification({
    userId: reservation.userId,
    type: "RESERVATION_CREATED",
    title: "Reservation created",
    message: `${reservation.resource.title} uchun band qilish so'rovi yaratildi.`,
    actionUrl: "/uz/cabinet/reservations",
    priority: "NORMAL"
  });

  const staff = await prisma.user.findMany({
    where: {
      role: {
        in: ["LIBRARIAN", "ADMIN"]
      },
      status: "ACTIVE"
    }
  });

  await createNotifications(
    staff.map((member) => ({
      userId: member.id,
      type: "RESERVATION_PENDING",
      title: "New reservation request",
      message: `${reservation.resource.title} uchun yangi band qilish so'rovi keldi.`,
      actionUrl: "/uz/librarian/reservations",
      priority: "NORMAL"
    }))
  );

  return reservation;
}

export async function listMyReservations(userId: string) {
  return reservationRepository.listByUser(userId);
}

export async function listReservations() {
  return reservationRepository.listAll();
}

export async function updateReservationStatus(user: User, reservationId: string, nextStatus: string, librarianNote?: string) {
  const reservation = await reservationRepository.findById(reservationId);
  if (!reservation) {
    throw new AppError("NOT_FOUND", "Reservation not found", 404);
  }

  if (nextStatus === "CANCELLED") {
    if (reservation.userId !== user.id && !["LIBRARIAN", "ADMIN"].includes(user.role)) {
      throw new AppError("FORBIDDEN", "Reservation cannot be cancelled", 403);
    }
  } else if (!["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "Only librarians can change this reservation", 403);
  }

  assertTransition(reservation.status, nextStatus, reservationTransitions);

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: nextStatus,
      librarianNote: librarianNote ?? reservation.librarianNote
    }
  });

  if (["REJECTED", "CANCELLED", "EXPIRED"].includes(nextStatus)) {
    await prisma.bookCopy.update({
      where: { id: reservation.copyId },
      data: { status: "AVAILABLE" }
    });
  }

  await writeAuditLog({
    userId: user.id,
    action: `RESERVATION_${nextStatus}`,
    entity: "Reservation",
    entityId: reservationId,
    oldValue: { status: reservation.status },
    newValue: { status: nextStatus }
  });

  if (["APPROVED", "REJECTED", "EXPIRED", "CANCELLED"].includes(nextStatus)) {
    await createNotification({
      userId: reservation.userId,
      type: `RESERVATION_${nextStatus}`,
      title: `Reservation ${nextStatus.toLowerCase()}`,
      message: `Band qilish holati ${nextStatus.toLowerCase()} ga o'zgardi.`,
      actionUrl: "/uz/cabinet/reservations",
      priority: nextStatus === "APPROVED" ? "NORMAL" : "HIGH"
    });
  }

  return updated;
}

export async function pickupReservation(user: User, reservationId: string) {
  if (!["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "Only librarians can issue a pickup", 403);
  }

  const reservation = await reservationRepository.findById(reservationId);
  if (!reservation) {
    throw new AppError("NOT_FOUND", "Reservation not found", 404);
  }

  assertTransition(reservation.status, "PICKED_UP", reservationTransitions);

  const result = await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.create({
      data: {
        userId: reservation.userId,
        resourceId: reservation.resourceId,
        copyId: reservation.copyId,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
      }
    });

    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: "PICKED_UP" }
    });

    await tx.bookCopy.update({
      where: { id: reservation.copyId },
      data: { status: "BORROWED" }
    });

    return loan;
  });

  await writeAuditLog({
    userId: user.id,
    action: "RESERVATION_PICKED_UP",
    entity: "Reservation",
    entityId: reservationId,
    newValue: { loanId: result.id }
  });

  await createNotification({
    userId: reservation.userId,
    type: "RESERVATION_PICKED_UP",
    title: "Loan issued",
    message: "Band qilingan nusxa topshirildi va loan yaratildi.",
    actionUrl: "/uz/cabinet/loans",
    priority: "NORMAL"
  });

  return result;
}
