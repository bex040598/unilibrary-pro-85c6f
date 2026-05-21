import { withRoute, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getLibrarianDashboard } from "@/server/services/librarian-dashboard-service";

export const GET = withRoute(async () => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const dashboard = await getLibrarianDashboard(user.id);
  return successResponse({
    reservations: dashboard.reservations,
    readingRoom: dashboard.seatBookings
  });
});
