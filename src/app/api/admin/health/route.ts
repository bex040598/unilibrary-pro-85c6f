import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getHealthStatus } from "@/server/services/admin-service";

export const GET = withRoute(async () => {
  await requireRole(["ADMIN"]);
  const health = await getHealthStatus();
  return successResponse(health);
});
