import { z } from "zod";

import { withRoute, successResponse, paginatedResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { createAdminEntity, listAdminEntity } from "@/server/services/admin-crud-service";

const querySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  role: z.string().optional(),
  facultyId: z.string().optional(),
  resourceType: z.string().optional(),
  accessType: z.string().optional()
});

export const GET = withRoute(async (request: Request, context: { params: Promise<{ entity: string }> }) => {
  await requireRole(["ADMIN"]);
  const { entity } = await context.params;
  const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));
  const result = await listAdminEntity(entity as never, parsed);
  return paginatedResponse(result.items as never[], result.meta.page, result.meta.limit, result.meta.total);
});

export const POST = withRoute(async (request: Request, context: { params: Promise<{ entity: string }> }) => {
  const user = await requireRole(["ADMIN"]);
  const { entity } = await context.params;
  const payload = await parseBody(request, z.record(z.any()));
  const created = await createAdminEntity(entity as never, payload, user.id);
  return successResponse(created, "Entity created");
});
