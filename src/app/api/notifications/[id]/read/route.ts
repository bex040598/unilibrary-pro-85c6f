import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { markNotificationRead } from "@/server/services/notification-service";

export const POST = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  await markNotificationRead(user.id, id);
  return successResponse({}, "Notification marked as read");
});
