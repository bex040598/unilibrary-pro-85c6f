import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getStudentDashboard } from "@/server/services/student-dashboard-service";

export const GET = withRoute(async () => {
  const user = await requireRole(["STUDENT"]);
  const dashboard = await getStudentDashboard(user.id);
  return successResponse(dashboard.resources);
});
