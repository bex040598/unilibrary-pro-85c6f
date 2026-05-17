import { AppError } from "@/lib/errors/app-error";
import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getAdminAnalytics } from "@/server/services/statistics-service";

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ report: string }> }) => {
  await requireRole(["ADMIN", "LIBRARIAN", "DEPARTMENT_HEAD"]);
  const { report } = await context.params;
  const analytics = await getAdminAnalytics();

  switch (report) {
    case "resources":
      return successResponse(analytics.resourcesByCategory);
    case "downloads":
      return successResponse(analytics.downloadsByMonth);
    case "views":
      return successResponse(analytics.viewsByMonth);
    case "departments":
      return successResponse(analytics.departmentActivity);
    case "search-keywords":
      return successResponse(analytics.topSearchKeywords);
    case "reservations":
      return successResponse(analytics.reservationTrend);
    case "loans":
      return successResponse(analytics.loanTrend);
    case "reading-room":
      return successResponse(analytics.readingRoomOccupancy);
    case "overdue":
      return successResponse(analytics.overdueTrend);
    case "faculty-activity":
      return successResponse(analytics.facultyActivity);
    default:
      throw new AppError("NOT_FOUND", "Statistics report not found", 404);
  }
});
