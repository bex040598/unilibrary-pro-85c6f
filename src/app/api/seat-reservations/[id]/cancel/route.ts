import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { updateSeatReservationStatus } from "@/server/services/reading-room-service";

export const POST = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  const reservation = await updateSeatReservationStatus(user, id, "CANCELLED");
  return successResponse(reservation, "Seat reservation cancelled");
});
