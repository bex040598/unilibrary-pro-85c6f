import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { listMySeatReservations } from "@/server/services/reading-room-service";

export const GET = withRoute(async () => {
  const user = await requireUser();
  const reservations = await listMySeatReservations(user.id);
  return successResponse(reservations);
});
