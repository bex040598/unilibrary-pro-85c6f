import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { listAllLoans, listOverdueLoans, returnLoan } from "@/server/services/loan-service";
import { listNotifications } from "@/server/services/notification-service";
import { listReservations, updateReservationStatus } from "@/server/services/reservation-service";
import { listReadingRooms, listSeatReservations } from "@/server/services/reading-room-service";
import { createResource, deleteResource, updateResource } from "@/server/services/resource-service";
import type { User } from "@prisma/client";

export async function getLibrarianDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      librarianProfile: true,
      department: true
    }
  });

  if (!user) {
    throw new AppError("NOT_FOUND", "Kutubxonachi topilmadi", 404);
  }

  const [resources, borrowings, overdue, reservations, readingRooms, seatBookings, pendingResources, notifications] = await Promise.all([
    prisma.resource.findMany({
      include: {
        category: true,
        department: true
      },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    listAllLoans(),
    listOverdueLoans(),
    listReservations(),
    listReadingRooms(),
    listSeatReservations(),
    prisma.resource.findMany({
      where: {
        status: "PENDING_REVIEW"
      },
      include: {
        uploadedBy: true,
        department: true
      },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    listNotifications(userId)
  ]);

  return {
    profile: {
      fullName: user.fullName,
      email: user.email,
      position: user.librarianProfile?.position ?? "Kutubxonachi",
      department: user.librarianProfile?.department ?? user.department?.nameUz ?? null,
      phone: user.librarianProfile?.phone ?? user.phone ?? null
    },
    resources,
    borrowings,
    overdue,
    reservations,
    readingRooms,
    seatBookings,
    pendingResources,
    reports: {
      mostViewedResources: resources
        .slice()
        .sort((left, right) => right.viewCount - left.viewCount)
        .slice(0, 5),
      activeStudents: borrowings.filter((loan) => ["ACTIVE", "EXTENDED", "OVERDUE"].includes(loan.status)).length,
      overdueCount: overdue.length
    },
    notifications: notifications.slice(0, 8)
  };
}

export async function listLibrarianResources() {
  return prisma.resource.findMany({
    include: {
      category: true,
      department: true,
      uploadedBy: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createLibrarianResource(user: User, payload: Parameters<typeof createResource>[1]) {
  return createResource(user, payload);
}

export async function updateLibrarianResource(user: User, resourceId: string, payload: Parameters<typeof updateResource>[2]) {
  return updateResource(user, resourceId, payload);
}

export async function deleteLibrarianResource(user: User, resourceId: string) {
  return deleteResource(user, resourceId);
}

export async function approveBorrowingReturn(user: User, loanId: string) {
  return returnLoan(user, loanId);
}

export async function approveBooking(user: User, reservationId: string) {
  return updateReservationStatus(user, reservationId, "APPROVED");
}

export async function rejectBooking(user: User, reservationId: string) {
  return updateReservationStatus(user, reservationId, "REJECTED");
}

export async function getLibrarianReports() {
  const [resources, overdue, activeStudents] = await Promise.all([
    prisma.resource.findMany({
      orderBy: [{ viewCount: "desc" }, { downloadCount: "desc" }],
      take: 10,
      include: {
        department: true
      }
    }),
    listOverdueLoans(),
    prisma.loan.groupBy({
      by: ["userId"],
      _count: {
        userId: true
      },
      orderBy: {
        _count: {
          userId: "desc"
        }
      },
      take: 10
    })
  ]);

  return {
    mostReadResources: resources,
    overdue,
    activeStudents
  };
}
