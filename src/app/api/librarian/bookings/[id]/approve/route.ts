import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { approveBooking } from "@/server/services/librarian-dashboard-service";

export const PATCH = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const reservation = await approveBooking(user, id);
  return successResponse(reservation, "Bron tasdiqlandi");
});
