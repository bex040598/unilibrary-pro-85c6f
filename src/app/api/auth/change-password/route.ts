import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { changePasswordSchema } from "@/lib/validation/auth";
import { requireUser } from "@/lib/permissions/rbac";
import { changePassword } from "@/server/services/auth-service";

export const POST = withRoute(async (request: Request) => {
  const user = await requireUser();
  const payload = await parseBody(request, changePasswordSchema);
  await changePassword(user.id, payload);
  return successResponse({}, "Password updated");
});
