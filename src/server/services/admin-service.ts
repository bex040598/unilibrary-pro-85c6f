import { prisma } from "@/lib/db/prisma";
import { getDatabaseHealth } from "@/lib/db/database-health";

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
  const database = await getDatabaseHealth();

  if (!database.ok) {
    return {
      status: "degraded",
      timestamp: new Date().toISOString(),
      database: {
        ok: database.ok,
        configured: database.diagnostics.configured,
        provider: database.diagnostics.provider,
        host: database.diagnostics.host,
        database: database.diagnostics.database,
        hint: database.diagnostics.hint,
        error: database.error
      },
      counts: {
        resources: 0,
        users: 0,
        loans: 0
      }
    };
  }

  const [resourceCount, userCount, loanCount] = await Promise.all([
    prisma.resource.count(),
    prisma.user.count(),
    prisma.loan.count()
  ]);

  return {
    status: database.ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: {
      ok: database.ok,
      configured: database.diagnostics.configured,
      provider: database.diagnostics.provider,
      host: database.diagnostics.host,
      database: database.diagnostics.database,
      hint: database.diagnostics.hint,
      error: database.error
    },
    counts: {
      resources: resourceCount,
      users: userCount,
      loans: loanCount
    }
  };
}
