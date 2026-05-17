import { withRoute, successResponse } from "@/lib/api/response";
import { getResourceBySlug } from "@/server/services/resource-service";

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
  const { slug } = await context.params;
  const resource = await getResourceBySlug(slug);
  return successResponse(resource);
});
