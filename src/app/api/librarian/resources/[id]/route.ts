import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { parseResourceFormData } from "@/lib/api/resource-form";
import { deleteLibrarianResource, updateLibrarianResource } from "@/server/services/librarian-dashboard-service";

async function updateHandler(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const { payload, file, coverImage } = await parseResourceFormData(request);
  const resource = await updateLibrarianResource(user, id, payload, file, coverImage);
  return successResponse(resource, "Resurs yangilandi");
}

export const PATCH = withRoute(updateHandler);
export const PUT = withRoute(updateHandler);

export const DELETE = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  await deleteLibrarianResource(user, id);
  return successResponse({}, "Resurs o'chirildi");
});
