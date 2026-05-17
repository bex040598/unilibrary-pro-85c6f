import { successResponse, withRoute } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/response";
import { queryPaginationSchema } from "@/lib/validation/common";
import { requireRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { buildPagination } from "@/lib/utils";

export const GET = withRoute(async (request: Request) => {
  await requireRole(["ADMIN"]);
  const parsed = parseQuery(request, queryPaginationSchema);
  const page = parsed.page ?? 1;
  const limit = parsed.limit ?? 20;
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.auditLog.count()
  ]);

  return successResponse(items, "OK", buildPagination(page, limit, total));
});
