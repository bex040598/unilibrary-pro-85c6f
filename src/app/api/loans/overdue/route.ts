import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { listOverdueLoans } from "@/server/services/loan-service";

export const GET = withRoute(async () => {
  await requireRole(["LIBRARIAN", "ADMIN"]);
  const loans = await listOverdueLoans();
  return successResponse(loans);
});
