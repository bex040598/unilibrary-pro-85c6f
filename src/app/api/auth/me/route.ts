import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";

export const GET = withRoute(async () => {
  const user = await requireUser();
  return successResponse({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  });
});
