import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requestPasswordReset } from "@/server/services/auth-service";

const schema = z.object({
  email: z.string().email()
});

export const POST = withRoute(async (request: Request) => {
  const payload = await parseBody(request, schema);
  const result = await requestPasswordReset(payload.email);
  return successResponse(result, result.message);
});
