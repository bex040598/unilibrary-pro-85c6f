import { prisma } from "@/lib/db/prisma";

export async function getSystemSettings() {
  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: "asc" }
  });

  return settings.map((setting) => ({
    ...setting,
    value: JSON.parse(setting.value)
  }));
}

export async function updateSystemSetting(key: string, value: unknown) {
  return prisma.systemSetting.upsert({
    where: { key },
    create: {
      key,
      value: JSON.stringify(value)
    },
    update: {
      value: JSON.stringify(value)
    }
  });
}

export async function getHealthStatus() {
  const [resourceCount, userCount, loanCount] = await Promise.all([
    prisma.resource.count(),
    prisma.user.count(),
    prisma.loan.count()
  ]);

  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    counts: {
      resources: resourceCount,
      users: userCount,
      loans: loanCount
    }
  };
}
