import { withRoute, successResponse } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/permissions/rbac";
import { getRequestMeta } from "@/lib/security/request-meta";
import { trackView } from "@/server/services/resource-service";

export const POST = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await getCurrentUser();
  const { id } = await context.params;
  await trackView(id, user?.id, getRequestMeta(request));
  return successResponse({ tracked: true });
});
