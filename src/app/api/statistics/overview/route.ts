import { withRoute, successResponse } from "@/lib/api/response";
import { getOverviewStats } from "@/server/services/statistics-service";

export const GET = withRoute(async () => {
  const stats = await getOverviewStats();
  return successResponse(stats);
});
