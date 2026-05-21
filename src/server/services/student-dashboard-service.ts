import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { daysBetween } from "@/lib/utils";
import { listMyLoans } from "@/server/services/loan-service";
import { listNotifications } from "@/server/services/notification-service";
import { listMyReservations } from "@/server/services/reservation-service";
import { listMySeatReservations } from "@/server/services/reading-room-service";

export async function getStudentDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      faculty: true,
      department: true,
      studentProfile: true
    }
  });

  if (!user) {
    throw new AppError("NOT_FOUND", "Talaba topilmadi", 404);
  }

  const recommendationScopes: Array<{ departmentId: string } | { facultyId: string }> = [];

  if (user.departmentId) {
    recommendationScopes.push({ departmentId: user.departmentId });
  }

  if (user.facultyId) {
    recommendationScopes.push({ facultyId: user.facultyId });
  }

  const [favorites, downloads, history, reservations, loans, bookings, notifications, recommendations] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    prisma.downloadLog.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    prisma.viewLog.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    listMyReservations(userId),
    listMyLoans(userId),
    listMySeatReservations(userId),
    listNotifications(userId),
    prisma.resource.findMany({
      where: {
        status: "APPROVED",
        uploadedById: {
          not: userId
        },
        ...(recommendationScopes.length ? { OR: recommendationScopes } : {})
      },
      include: {
        category: true,
        department: true
      },
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      take: 6
    })
  ]);

  const activeLoans = loans.filter((loan) => ["ACTIVE", "EXTENDED", "OVERDUE"].includes(loan.status));
  const overdueLoans = activeLoans.filter((loan) => loan.status === "OVERDUE" || loan.dueAt < new Date());

  return {
    profile: {
      fullName: user.fullName,
      email: user.email,
      group: user.studentProfile?.group ?? null,
      faculty: user.studentProfile?.faculty ?? user.faculty?.nameUz ?? null,
      direction: user.studentProfile?.direction ?? user.department?.nameUz ?? null,
      studentNumber: user.studentProfile?.studentNumber ?? user.studentId ?? null
    },
    resources: {
      favorites,
      downloads,
      history
    },
    borrowings: {
      items: loans,
      activeCount: activeLoans.length,
      overdueCount: overdueLoans.length,
      dueSoon: activeLoans
        .filter((loan) => daysBetween(loan.dueAt) <= 3)
        .map((loan) => ({
          id: loan.id,
          title: loan.resource.title,
          dueDate: loan.dueAt
        }))
    },
    bookings,
    reservations,
    recommendations,
    notifications: notifications.slice(0, 8)
  };
}
