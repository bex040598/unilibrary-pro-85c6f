import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { deleteAdminEntity, updateAdminEntity } from "@/server/services/admin-crud-service";

export const PUT = withRoute(async (request: Request, context: { params: Promise<{ entity: string; id: string }> }) => {
  const user = await requireRole(["ADMIN"]);
  const { entity, id } = await context.params;
  const payload = await parseBody(request, z.record(z.any()));
  const updated = await updateAdminEntity(entity as never, id, payload, user.id);
  return successResponse(updated, "Entity updated");
});

export const DELETE = withRoute(async (_request: Request, context: { params: Promise<{ entity: string; id: string }> }) => {
  const user = await requireRole(["ADMIN"]);
  const { entity, id } = await context.params;
  await deleteAdminEntity(entity as never, id, user.id);
  return successResponse({}, "Entity deleted");
});
