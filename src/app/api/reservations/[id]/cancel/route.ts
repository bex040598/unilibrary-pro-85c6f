import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { updateReservationStatus } from "@/server/services/reservation-service";

export const POST = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  const reservation = await updateReservationStatus(user, id, "CANCELLED");
  return successResponse(reservation, "Reservation cancelled");
});
