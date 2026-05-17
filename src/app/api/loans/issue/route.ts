import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { issueLoan } from "@/server/services/loan-service";

const schema = z.object({
  userId: z.string().min(1),
  resourceId: z.string().min(1),
  copyId: z.string().min(1),
  dueAt: z.string().datetime()
});

export const POST = withRoute(async (request: Request) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const payload = await parseBody(request, schema);
  const loan = await issueLoan(user, {
    ...payload,
    dueAt: new Date(payload.dueAt)
  });
  return successResponse(loan, "Loan issued");
});
