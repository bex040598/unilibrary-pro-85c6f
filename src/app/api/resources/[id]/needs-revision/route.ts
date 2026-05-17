import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { transitionResource } from "@/server/services/resource-service";

const schema = z.object({
  reason: z.string().min(3)
});

export const POST = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["MODERATOR", "LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const payload = await parseBody(request, schema);
  const resource = await transitionResource(user, id, "NEEDS_REVISION", payload.reason);
  return successResponse(resource, "Revision requested");
});
