import { withRoute, successResponse } from "@/lib/api/response";
import { parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { reservationSchema } from "@/lib/validation/reservation";
import { createReservation, listReservations } from "@/server/services/reservation-service";

export const GET = withRoute(async () => {
  await requireRole(["LIBRARIAN", "ADMIN"]);
  const reservations = await listReservations();
  return successResponse(reservations);
});

export const POST = withRoute(async (request: Request) => {
  const user = await requireRole(["STUDENT", "TEACHER", "DEPARTMENT_HEAD", "LIBRARIAN", "ADMIN"]);
  const payload = await parseBody(request, reservationSchema);
  const reservation = await createReservation(user, payload.resourceId, new Date(payload.pickupDate));
  return successResponse(reservation, "Reservation created");
});
