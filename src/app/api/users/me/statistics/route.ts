import { successResponse, withRoute } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { getUserStatistics } from "@/server/services/user-profile-service";

export const GET = withRoute(async () => {
  const user = await requireUser();
  return successResponse(await getUserStatistics(user.id));
});
