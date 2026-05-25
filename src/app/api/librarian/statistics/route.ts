import { successResponse, withRoute } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getLibrarianDashboard } from "@/server/services/librarian-dashboard-service";
import { getAdminAnalytics, getOverviewStats } from "@/server/services/statistics-service";

export const GET = withRoute(async () => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const [dashboard, overview, analytics] = await Promise.all([
    getLibrarianDashboard(user.id),
    getOverviewStats(),
    getAdminAnalytics()
  ]);

  return successResponse({
    metrics: dashboard.metrics,
    reports: dashboard.reports,
    overview,
    topResources: analytics.topResources,
    activeUsers: analytics.activeUsers,
    departments: analytics.departmentActivity,
    faculties: analytics.facultyActivity,
    viewsByMonth: analytics.viewsByMonth,
    downloadsByMonth: analytics.downloadsByMonth
  });
});
