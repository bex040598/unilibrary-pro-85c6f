import { successResponse, withRoute } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { getUserActivity } from "@/server/services/user-profile-service";

export const GET = withRoute(async () => {
  const user = await requireUser();
  return successResponse(await getUserActivity(user.id));
});
