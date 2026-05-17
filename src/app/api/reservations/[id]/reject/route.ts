import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { updateReservationStatus } from "@/server/services/reservation-service";

const schema = z.object({
  librarianNote: z.string().optional()
});

export const POST = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const payload = await parseBody(request, schema);
  const reservation = await updateReservationStatus(user, id, "REJECTED", payload.librarianNote);
  return successResponse(reservation, "Reservation rejected");
});
