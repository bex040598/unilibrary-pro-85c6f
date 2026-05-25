import { successResponse, withRoute } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getLibrarianDashboard } from "@/server/services/librarian-dashboard-service";

export const GET = withRoute(async () => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  return successResponse(await getLibrarianDashboard(user.id));
});
