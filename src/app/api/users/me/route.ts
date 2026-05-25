import { parseBody, successResponse, withRoute } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { updateProfileSchema } from "@/lib/validation/user-profile";
import { getUserProfileBundle, updateMyProfile } from "@/server/services/user-profile-service";

export const GET = withRoute(async () => {
  const user = await requireUser();
  const profile = await getUserProfileBundle(user.id);
  return successResponse(profile.summary);
});

export const PATCH = withRoute(async (request: Request) => {
  const user = await requireUser();
  const payload = await parseBody(request, updateProfileSchema);
  const updated = await updateMyProfile(user.id, payload);
  return successResponse(updated, "Profil yangilandi");
});
