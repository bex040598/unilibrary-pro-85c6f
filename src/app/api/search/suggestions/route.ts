import { withRoute, successResponse } from "@/lib/api/response";
import { resourceRepository } from "@/server/repositories/resource-repository";

export const GET = withRoute(async (request: Request) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const suggestions = q ? await resourceRepository.getSuggestions(q) : [];
  return successResponse(suggestions);
});
