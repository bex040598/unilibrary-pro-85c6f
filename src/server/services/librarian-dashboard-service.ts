import type { User } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { listAllLoans, listOverdueLoans, returnLoan } from "@/server/services/loan-service";
import { listNotifications } from "@/server/services/notification-service";
import { listReservations, updateReservationStatus } from "@/server/services/reservation-service";
import { listReadingRooms, listSeatReservations } from "@/server/services/reading-room-service";
import { createResource, deleteResource, updateResource } from "@/server/services/resource-service";

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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [resources, borrowings, overdue, reservations, readingRooms, seatBookings, pendingResources, notifications] = await Promise.all([
    prisma.resource.findMany({
      include: {
        category: true,
        department: true
      },
      orderBy: { createdAt: "desc" },
      take: 12
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

  const [todayAddedResources, todayViews, todayDownloads, addedResourcesCount, approvedResourcesCount, todayActions] = await Promise.all([
    prisma.resource.count({
      where: {
        uploadedById: userId,
        createdAt: {
          gte: todayStart
        }
      }
    }),
    prisma.viewLog.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    }),
    prisma.downloadLog.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    }),
    prisma.resource.count({ where: { uploadedById: userId } }),
    prisma.resource.count({ where: { approvedById: userId, status: "APPROVED" } }),
    prisma.auditLog.count({
      where: {
        userId,
        createdAt: {
          gte: todayStart
        }
      }
    })
  ]);

  return {
    profile: {
      fullName: user.fullName,
      email: user.email,
      position: user.librarianProfile?.position ?? "Kutubxonachi",
      department: user.librarianProfile?.department ?? user.department?.nameUz ?? null,
      phone: user.librarianProfile?.phone ?? user.phone ?? null,
      employeeId: user.employeeId ?? null,
      role: user.role
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
    metrics: {
      totalResources: resources.length,
      todayAddedResources,
      todayViews,
      todayDownloads,
      addedResourcesCount,
      approvedResourcesCount,
      todayActions
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

export async function createLibrarianResource(
  user: User,
  payload: Parameters<typeof createResource>[1],
  file?: File | null,
  coverImage?: File | null
) {
  return createResource(user, payload, file, coverImage);
}

export async function updateLibrarianResource(
  user: User,
  resourceId: string,
  payload: Parameters<typeof updateResource>[2],
  file?: File | null,
  coverImage?: File | null
) {
  return updateResource(user, resourceId, payload, file, coverImage);
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
