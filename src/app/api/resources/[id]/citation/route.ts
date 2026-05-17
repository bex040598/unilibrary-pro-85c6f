import { withRoute, successResponse } from "@/lib/api/response";
import { getCitation } from "@/server/services/resource-service";

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const citation = await getCitation(id);
  return successResponse(citation);
});
