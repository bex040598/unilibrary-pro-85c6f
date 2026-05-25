import { successResponse, withRoute } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { getHealthStatus, getSystemSettings } from "@/server/services/admin-service";
import { getAdminAnalytics, getOverviewStats } from "@/server/services/statistics-service";

export const GET = withRoute(async () => {
  await requireRole(["ADMIN"]);

  const [overview, analytics, health, settings, auditLogs] = await Promise.all([
    getOverviewStats(),
    getAdminAnalytics(),
    getHealthStatus(),
    getSystemSettings().catch(() => []),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return successResponse({
    overview,
    analytics,
    health,
    settings,
    auditLogs
  });
});
