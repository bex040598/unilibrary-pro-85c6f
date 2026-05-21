import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { rejectBooking } from "@/server/services/librarian-dashboard-service";

export const PATCH = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const reservation = await rejectBooking(user, id);
  return successResponse(reservation, "Bron rad etildi");
});
