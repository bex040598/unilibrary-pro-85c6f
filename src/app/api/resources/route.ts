import { withRoute, successResponse, paginatedResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { parseResourceFormData } from "@/lib/api/resource-form";
import { resourceQuerySchema } from "@/lib/validation/resource";
import { createResource, listResources } from "@/server/services/resource-service";

export const GET = withRoute(async (request: Request) => {
  const url = new URL(request.url);
  const parsed = resourceQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
  const result = await listResources(parsed);
  return paginatedResponse(result.items, result.meta.page, result.meta.limit, result.meta.total);
});

export const POST = withRoute(async (request: Request) => {
  const user = await requireRole(["TEACHER", "LIBRARIAN", "ADMIN"]);
  const { payload, file, coverImage } = await parseResourceFormData(request);
  const resource = await createResource(user, payload, file, coverImage);
  return successResponse(resource, "Resource created");
});
