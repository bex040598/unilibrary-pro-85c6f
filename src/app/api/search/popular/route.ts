import { withRoute, successResponse } from "@/lib/api/response";
import { getPopularSearches } from "@/server/services/statistics-service";

export const GET = withRoute(async () => {
  const searches = await getPopularSearches();
  return successResponse(searches);
});
