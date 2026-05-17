import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { listNotifications } from "@/server/services/notification-service";

export const GET = withRoute(async (request: Request) => {
  const user = await requireUser();
  const type = new URL(request.url).searchParams.get("type") ?? undefined;
  const notifications = await listNotifications(user.id, type);
  return successResponse(notifications);
});
