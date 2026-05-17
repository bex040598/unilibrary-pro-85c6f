import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { listAllLoans } from "@/server/services/loan-service";

export const GET = withRoute(async () => {
  await requireRole(["LIBRARIAN", "ADMIN"]);
  const loans = await listAllLoans();
  return successResponse(loans);
});
