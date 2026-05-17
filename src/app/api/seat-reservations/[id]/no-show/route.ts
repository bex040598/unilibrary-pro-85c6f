import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { updateSeatReservationStatus } from "@/server/services/reading-room-service";

export const POST = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const reservation = await updateSeatReservationStatus(user, id, "NO_SHOW");
  return successResponse(reservation, "Seat reservation marked as no-show");
});
