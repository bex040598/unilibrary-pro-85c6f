import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getLibrarianReports } from "@/server/services/librarian-dashboard-service";

export const GET = withRoute(async () => {
  await requireRole(["LIBRARIAN", "ADMIN"]);
  const reports = await getLibrarianReports();
  return successResponse(reports);
});
