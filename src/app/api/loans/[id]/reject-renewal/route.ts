import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { reviewRenewal } from "@/server/services/loan-service";

const schema = z.object({
  librarianNote: z.string().optional()
});

export const POST = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const payload = await parseBody(request, schema);
  const renewal = await reviewRenewal(user, id, false, payload.librarianNote);
  return successResponse(renewal, "Renewal rejected");
});
