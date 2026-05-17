import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { resetPassword } from "@/server/services/auth-service";

const schema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8)
});

export const POST = withRoute(async (request: Request) => {
  const payload = await parseBody(request, schema);
  await resetPassword(payload.token, payload.newPassword);
  return successResponse({}, "Password reset completed");
});
