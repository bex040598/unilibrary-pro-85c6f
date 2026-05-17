import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { pickupReservation } from "@/server/services/reservation-service";

export const POST = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const loan = await pickupReservation(user, id);
  return successResponse(loan, "Pickup completed and loan created");
});
