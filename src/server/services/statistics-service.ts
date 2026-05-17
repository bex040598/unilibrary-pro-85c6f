import { prisma } from "@/lib/db/prisma";

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function groupMonthly(items: Date[]) {
  const map = new Map<string, number>();

  for (const item of items) {
    const key = monthKey(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, count]) => ({ month, count }));
}

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

export async function getAdminAnalytics() {
  const [
    resourcesByCategory,
    downloads,
    views,
    reservations,
    loans,
    faculties,
    departments,
    roomOccupancy,
    popularSearches
  ] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            resources: true
          }
        }
      },
      orderBy: { nameUz: "asc" }
    }),
    prisma.downloadLog.findMany({ select: { createdAt: true } }),
    prisma.viewLog.findMany({ select: { createdAt: true } }),
    prisma.reservation.findMany({ select: { createdAt: true } }),
    prisma.loan.findMany({ select: { createdAt: true, status: true, dueAt: true } }),
    prisma.faculty.findMany({
      include: {
        _count: {
          select: {
            resources: true,
            users: true
          }
        }
      },
      orderBy: { nameUz: "asc" }
    }),
    prisma.department.findMany({
      include: {
        _count: {
          select: {
            resources: true,
            users: true
          }
        }
      },
      orderBy: { nameUz: "asc" }
    }),
    prisma.readingRoom.findMany({
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      }
    }),
    getPopularSearches()
  ]);

  const overdueTrend = groupMonthly(
    loans.filter((item) => item.status === "OVERDUE" || item.dueAt < new Date()).map((item) => item.dueAt)
  );

  return {
    resourcesByCategory: resourcesByCategory.map((item) => ({
      label: item.nameUz,
      value: item._count.resources
    })),
    downloadsByMonth: groupMonthly(downloads.map((item) => item.createdAt)),
    viewsByMonth: groupMonthly(views.map((item) => item.createdAt)),
    reservationTrend: groupMonthly(reservations.map((item) => item.createdAt)),
    loanTrend: groupMonthly(loans.map((item) => item.createdAt)),
    overdueTrend,
    facultyActivity: faculties.map((item) => ({
      label: item.nameUz,
      resources: item._count.resources,
      users: item._count.users
    })),
    departmentActivity: departments.map((item) => ({
      label: item.nameUz,
      resources: item._count.resources,
      users: item._count.users
    })),
    readingRoomOccupancy: roomOccupancy.map((item) => ({
      label: item.name,
      value: item._count.bookings
    })),
    topSearchKeywords: popularSearches.map((item) => ({
      label: item.query,
      value: item._count.query
    }))
  };
}

export function toCsv(rows: Record<string, string | number | null | undefined>[]) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | null | undefined) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;

  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}
