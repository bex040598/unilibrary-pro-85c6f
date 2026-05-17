import { withRoute, successResponse } from "@/lib/api/response";
import { parseBody } from "@/lib/api/response";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser } from "@/server/services/auth-service";

export const POST = withRoute(async (request: Request) => {
  const payload = await parseBody(request, registerSchema);
  const user = await registerUser({
    ...payload,
    role: payload.role ?? "STUDENT"
  });
  return successResponse(
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    "User registered"
  );
});
