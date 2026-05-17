import { prisma } from "@/lib/db/prisma";

type NotificationPayload = {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  priority?: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  dedupeHours?: number;
};

function getDedupeThreshold(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export async function createNotification(payload: NotificationPayload) {
  if (payload.dedupeHours) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        createdAt: {
          gte: getDedupeThreshold(payload.dedupeHours)
        }
      }
    });

    if (existing) {
      return existing;
    }
  }

  return prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      actionUrl: payload.actionUrl ?? null,
      priority: payload.priority ?? "NORMAL"
    }
  });
}

export async function createNotifications(payloads: NotificationPayload[]) {
  return Promise.all(payloads.map((payload) => createNotification(payload)));
}

export async function listNotifications(userId: string, type?: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(type ? { type } : {})
    },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }]
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId
    },
    data: {
      readAt: new Date()
    }
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });
}

export async function createLoanAlerts(userId: string) {
  const loans = await prisma.loan.findMany({
    where: {
      userId,
      status: {
        in: ["ACTIVE", "EXTENDED", "OVERDUE"]
      }
    },
    include: {
      resource: true
    }
  });

  const now = Date.now();
  const dueSoonThreshold = now + 1000 * 60 * 60 * 24 * 3;

  await Promise.all(
    loans.map((loan) => {
      if (loan.status === "OVERDUE" || loan.dueAt.getTime() < now) {
        return createNotification({
          userId,
          type: "LOAN_OVERDUE",
          title: "Loan overdue",
          message: `${loan.resource.title} qaytarish muddati o'tib ketdi.`,
          actionUrl: "/uz/cabinet/loans",
          priority: "HIGH",
          dedupeHours: 24
        });
      }

      if (loan.dueAt.getTime() <= dueSoonThreshold) {
        return createNotification({
          userId,
          type: "LOAN_DUE_SOON",
          title: "Loan due soon",
          message: `${loan.resource.title} yaqin kunlarda qaytarilishi kerak.`,
          actionUrl: "/uz/cabinet/loans",
          priority: "NORMAL",
          dedupeHours: 24
        });
      }

      return Promise.resolve(null);
    })
  );
}
