import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { listNotifications } from "@/server/services/notification-service";

export async function getUserProfileBundle(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      faculty: true,
      department: true,
      studentProfile: true,
      librarianProfile: true
    }
  });

  if (!user) {
    throw new AppError("NOT_FOUND", "Foydalanuvchi topilmadi", 404);
  }

  const [favoritesCount, downloadsCount, viewsCount, reservationsCount, loansCount, uploadedResourcesCount, approvedResourcesCount, auditActionsCount, securityLogsCount, notifications] =
    await Promise.all([
      prisma.favorite.count({ where: { userId } }),
      prisma.downloadLog.count({ where: { userId } }),
      prisma.viewLog.count({ where: { userId } }),
      prisma.reservation.count({ where: { userId } }),
      prisma.loan.count({ where: { userId } }),
      prisma.resource.count({ where: { uploadedById: userId } }),
      prisma.resource.count({ where: { approvedById: userId } }),
      prisma.auditLog.count({ where: { userId } }),
      prisma.securityLog.count({ where: { userId } }),
      listNotifications(userId)
    ]);

  return {
    user,
    summary: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      faculty: user.faculty?.nameUz ?? user.studentProfile?.faculty ?? null,
      department: user.department?.nameUz ?? user.librarianProfile?.department ?? user.studentProfile?.direction ?? null,
      studentNumber: user.studentProfile?.studentNumber ?? user.studentId ?? null,
      group: user.studentProfile?.group ?? null,
      employeeId: user.employeeId ?? null,
      position: user.librarianProfile?.position ?? null,
      lastLoginAt: user.lastLoginAt,
      favoritesCount,
      downloadsCount,
      viewsCount,
      reservationsCount,
      loansCount,
      uploadedResourcesCount,
      approvedResourcesCount,
      auditActionsCount,
      securityLogsCount,
      unreadNotifications: notifications.filter((item) => !item.readAt).length
    }
  };
}

export async function getUserStatistics(userId: string) {
  const [views, downloads, favorites, reservations, reviews, topCategories, recentViews, recentDownloads] = await Promise.all([
    prisma.viewLog.count({ where: { userId } }),
    prisma.downloadLog.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.reservation.count({ where: { userId } }),
    prisma.review.count({ where: { userId } }),
    prisma.favorite.findMany({
      where: { userId },
      include: { resource: { include: { category: true } } }
    }),
    prisma.viewLog.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.downloadLog.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const categoryMap = new Map<string, number>();
  for (const item of topCategories) {
    const label = item.resource.category.nameUz;
    categoryMap.set(label, (categoryMap.get(label) ?? 0) + 1);
  }

  return {
    views,
    downloads,
    favorites,
    reservations,
    reviews,
    topCategories: Array.from(categoryMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5),
    recentViews,
    recentDownloads
  };
}

export async function getUserActivity(userId: string) {
  const [history, downloads, favorites, notifications] = await Promise.all([
    prisma.viewLog.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.downloadLog.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.favorite.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    listNotifications(userId)
  ]);

  return {
    history,
    downloads,
    favorites,
    notifications
  };
}

export async function updateMyProfile(
  userId: string,
  input: {
    fullName?: string;
    phone?: string | null;
    avatar?: string | null;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      fullName: input.fullName,
      phone: input.phone,
      avatar: input.avatar
    }
  });
}
