import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { createSeat, listSeats } from "@/server/services/reading-room-service";

const schema = z.object({
  seatNumber: z.string().min(1),
  hasPowerSocket: z.boolean().optional(),
  hasComputer: z.boolean().optional()
});

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const seats = await listSeats(id);
  return successResponse(seats);
});

export const POST = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const payload = await parseBody(request, schema);
  const seat = await createSeat(user, id, payload);
  return successResponse(seat, "Seat created");
});
