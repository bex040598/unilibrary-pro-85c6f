export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { getOverviewStats } from "@/server/services/statistics-service";
import { getHealthStatus, getSystemSettings } from "@/server/services/admin-service";
import { prisma } from "@/lib/db/prisma";

export default async function AdminPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requirePageRole("admin", locale);
  const [stats, health, settings, auditLogs, securityLogs] = await Promise.all([
    getOverviewStats(),
    getHealthStatus(),
    getSystemSettings().catch(() => []),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.securityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 })
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Boshqaruv ko‘rinishi</p>
        <h1 className="mt-2 text-3xl font-semibold">Admin paneli</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Jami resurslar" value={stats.totalResources} />
        <StatCard label="Jami foydalanuvchilar" value={stats.totalUsers} />
        <StatCard label="Tasdiq kutilayotgan resurslar" value={stats.pendingResources} />
        <StatCard label="Muvaffaqiyatsiz kirishlar" value={stats.failedLogins} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Tizim holati</h2>
          <pre className="overflow-x-auto rounded-2xl bg-surface-soft p-4 text-sm">{JSON.stringify(health, null, 2)}</pre>
          <pre className="overflow-x-auto rounded-2xl bg-surface-soft p-4 text-sm">{JSON.stringify(settings, null, 2)}</pre>
        </Card>
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Audit loglari</h2>
          {auditLogs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">
                {log.action} / {log.entity}
              </p>
              <p className="text-muted-foreground">{log.createdAt.toISOString()}</p>
            </div>
          ))}
        </Card>
      </div>
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Xavfsizlik loglari</h2>
        {securityLogs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
            <p className="font-medium">
              {log.event} / {log.severity}
            </p>
            <p className="text-muted-foreground">{log.createdAt.toISOString()}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
