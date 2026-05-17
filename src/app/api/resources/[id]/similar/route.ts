import { withRoute, successResponse } from "@/lib/api/response";
import { listSimilarResources } from "@/server/services/resource-service";

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const similar = await listSimilarResources(id);
  return successResponse(similar);
});
