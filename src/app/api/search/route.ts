import { withRoute, paginatedResponse } from "@/lib/api/response";
import { resourceQuerySchema } from "@/lib/validation/resource";
import { listResources } from "@/server/services/resource-service";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/permissions/rbac";

export const GET = withRoute(async (request: Request) => {
  const url = new URL(request.url);
  const parsed = resourceQuerySchema.parse({
    ...Object.fromEntries(url.searchParams.entries()),
    q: url.searchParams.get("q") ?? undefined
  });
  const result = await listResources(parsed);
  const user = await getCurrentUser();
  await prisma.searchLog.create({
    data: {
      userId: user?.id ?? null,
      query: parsed.q ?? "",
      filters: JSON.stringify(parsed),
      resultCount: result.meta.total
    }
  });
  return paginatedResponse(result.items, result.meta.page, result.meta.limit, result.meta.total);
});
