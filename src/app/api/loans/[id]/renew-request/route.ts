import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { renewalRequestSchema } from "@/lib/validation/reservation";
import { requestRenewal } from "@/server/services/loan-service";

export const POST = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  const payload = await parseBody(request, renewalRequestSchema);
  const renewal = await requestRenewal(user, id, new Date(payload.requestedDueAt));
  return successResponse(renewal, "Renewal request submitted");
});
