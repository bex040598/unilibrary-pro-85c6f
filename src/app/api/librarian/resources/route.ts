import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { parseResourceFormData } from "@/lib/api/resource-form";
import { createLibrarianResource, listLibrarianResources } from "@/server/services/librarian-dashboard-service";

export const GET = withRoute(async () => {
  await requireRole(["LIBRARIAN", "ADMIN"]);
  const resources = await listLibrarianResources();
  return successResponse(resources);
});

export const POST = withRoute(async (request: Request) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { payload, file, coverImage } = await parseResourceFormData(request);
  const resource = await createLibrarianResource(user, payload, file, coverImage);
  return successResponse(resource, "Resurs yaratildi");
});
