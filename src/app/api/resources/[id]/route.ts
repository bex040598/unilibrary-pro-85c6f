import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getResourceById, updateResource, deleteResource } from "@/server/services/resource-service";
import { parseResourceFormData } from "@/lib/api/resource-form";

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const resource = await getResourceById(id);
  return successResponse(resource);
});

export const PUT = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["TEACHER", "LIBRARIAN", "MODERATOR", "ADMIN"]);
  const { id } = await context.params;
  const { payload, file } = await parseResourceFormData(request);
  const resource = await updateResource(user, id, payload, file);
  return successResponse(resource, "Resource updated");
});

export const DELETE = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["TEACHER", "LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  await deleteResource(user, id);
  return successResponse({}, "Resource deleted");
});
