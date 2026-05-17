import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { reviewRenewal } from "@/server/services/loan-service";

export const POST = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const renewal = await reviewRenewal(user, id, true);
  return successResponse(renewal, "Renewal approved");
});
