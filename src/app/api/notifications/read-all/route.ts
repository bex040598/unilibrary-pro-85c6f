import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { markAllNotificationsRead } from "@/server/services/notification-service";

export const POST = withRoute(async () => {
  const user = await requireUser();
  await markAllNotificationsRead(user.id);
  return successResponse({}, "Notifications marked as read");
});
