import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { seatReservationSchema } from "@/lib/validation/seat";
import { createSeatReservation, listSeatReservations } from "@/server/services/reading-room-service";

export const GET = withRoute(async () => {
  await requireRole(["LIBRARIAN", "ADMIN"]);
  const reservations = await listSeatReservations();
  return successResponse(reservations);
});

export const POST = withRoute(async (request: Request) => {
  const user = await requireRole(["STUDENT", "TEACHER", "DEPARTMENT_HEAD", "LIBRARIAN", "ADMIN"]);
  const payload = await parseBody(request, seatReservationSchema);
  const reservation = await createSeatReservation(user, {
    roomId: payload.roomId,
    seatId: payload.seatId,
    startTime: new Date(payload.startTime),
    endTime: new Date(payload.endTime)
  });
  return successResponse(reservation, "Seat reserved");
});
