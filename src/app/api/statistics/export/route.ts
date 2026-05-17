import { withRoute } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getAdminAnalytics, toCsv } from "@/server/services/statistics-service";

export const GET = withRoute(async (request: Request) => {
  await requireRole(["ADMIN", "LIBRARIAN", "DEPARTMENT_HEAD"]);
  const report = new URL(request.url).searchParams.get("report") ?? "resources";
  const analytics = await getAdminAnalytics();

  const rows =
    report === "downloads"
      ? analytics.downloadsByMonth
      : report === "views"
        ? analytics.viewsByMonth
        : report === "reservations"
          ? analytics.reservationTrend
          : report === "loans"
            ? analytics.loanTrend
            : report === "overdue"
              ? analytics.overdueTrend
              : report === "faculty-activity"
                ? analytics.facultyActivity
                : report === "departments"
                  ? analytics.departmentActivity
                  : report === "search-keywords"
                    ? analytics.topSearchKeywords
                    : report === "reading-room"
                      ? analytics.readingRoomOccupancy
                      : analytics.resourcesByCategory;

  return new Response(toCsv(rows as Record<string, string | number | null | undefined>[]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${report}.csv"`
    }
  });
});
