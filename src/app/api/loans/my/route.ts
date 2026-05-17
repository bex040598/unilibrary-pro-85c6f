import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { listMyLoans } from "@/server/services/loan-service";

export const GET = withRoute(async () => {
  const user = await requireUser();
  const loans = await listMyLoans(user.id);
  return successResponse(loans);
});
