import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { resourceInputSchema } from "@/lib/validation/resource";
import { deleteLibrarianResource, updateLibrarianResource } from "@/server/services/librarian-dashboard-service";

export const PATCH = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const payload = resourceInputSchema.parse(await request.json());
  const resource = await updateLibrarianResource(user, id, payload);
  return successResponse(resource, "Resurs yangilandi");
});

export const DELETE = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  await deleteLibrarianResource(user, id);
  return successResponse({}, "Resurs o'chirildi");
});
