import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { approveBorrowingReturn } from "@/server/services/librarian-dashboard-service";

export const PATCH = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const result = await approveBorrowingReturn(user, id);
  return successResponse(result, "Kitob qaytarildi");
});
