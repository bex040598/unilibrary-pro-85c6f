import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { listMyReservations } from "@/server/services/reservation-service";

export const GET = withRoute(async () => {
  const user = await requireUser();
  const reservations = await listMyReservations(user.id);
  return successResponse(reservations);
});
