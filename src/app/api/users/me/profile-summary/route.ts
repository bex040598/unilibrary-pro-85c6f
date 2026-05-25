import { successResponse, withRoute } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { getUserProfileBundle } from "@/server/services/user-profile-service";

export const GET = withRoute(async () => {
  const user = await requireUser();
  const bundle = await getUserProfileBundle(user.id);
  return successResponse(bundle.summary);
});
