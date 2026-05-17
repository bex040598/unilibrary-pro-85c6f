import { withRoute, successResponse } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/permissions/rbac";
import { getRequestMeta } from "@/lib/security/request-meta";
import { trackDownload } from "@/server/services/resource-service";

export const POST = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await getCurrentUser();
  const { id } = await context.params;
  await trackDownload(id, user?.id, getRequestMeta(request));
  return successResponse({ tracked: true, url: `/api/files/resources/${id}?download=1` });
});
