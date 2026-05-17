import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { transitionResource } from "@/server/services/resource-service";

export const POST = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["MODERATOR", "LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const resource = await transitionResource(user, id, "APPROVED");
  return successResponse(resource, "Resource approved");
});
