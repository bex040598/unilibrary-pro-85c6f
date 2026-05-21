import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { loginSchema } from "@/lib/validation/auth";
import { loginUser } from "@/server/services/auth-service";
import { createSessionToken, getAuthCookieOptions, authCookieName } from "@/lib/auth/session";
import { getRequestMeta } from "@/lib/security/request-meta";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { getRoleDashboardPath } from "@/lib/role-dashboard";

export const POST = withRoute(async (request: Request) => {
  const payload = await parseBody(request, loginSchema);
  const meta = getRequestMeta(request);
  enforceRateLimit(`login:${payload.email}:${meta.ipAddress}`, 10, 1000 * 60 * 15);
  const user = await loginUser({ ...payload, ...meta });
  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role as never
  });

  const response = successResponse(
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      redirectTo: getRoleDashboardPath("uz", user.role)
    },
    "Kirish muvaffaqiyatli"
  );

  response.cookies.set(authCookieName, token, getAuthCookieOptions());
  return response;
});
