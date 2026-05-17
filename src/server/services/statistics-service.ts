import { prisma } from "@/lib/db/prisma";

export async function getOverviewStats() {
  const [
    totalResources,
    totalUsers,
    activeStudents,
    todayDownloads,
    pendingResources,
    overdueBooks,
    activeLoans,
    readingOccupancy,
    failedLogins
  ] = await Promise.all([
    prisma.resource.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
    prisma.downloadLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.resource.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.loan.count({ where: { status: "OVERDUE" } }),
    prisma.loan.count({ where: { status: { in: ["ACTIVE", "EXTENDED", "OVERDUE"] } } }),
    prisma.seatReservation.count({ where: { status: { in: ["BOOKED", "CHECKED_IN"] } } }),
    prisma.securityLog.count({ where: { event: "LOGIN_FAILED" } })
  ]);

  return {
    totalResources,
    totalUsers,
    activeStudents,
    todayDownloads,
    pendingResources,
    overdueBooks,
    activeLoans,
    readingOccupancy,
    failedLogins
  };
}

export async function getPopularSearches() {
  return prisma.searchLog.groupBy({
    by: ["query"],
    _count: {
      query: true
    },
    orderBy: {
      _count: {
        query: "desc"
      }
    },
    take: 8
  });
}
