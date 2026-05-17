import { withRoute, successResponse } from "@/lib/api/response";
import { authCookieName } from "@/lib/auth/session";

export const POST = withRoute(async () => {
  const response = successResponse({}, "Logged out");
  response.cookies.set(authCookieName, "", {
    path: "/",
    maxAge: 0
  });
  return response;
});
