import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { reviewSchema } from "@/lib/validation/resource";
import { createReview, listReviews } from "@/server/services/resource-service";

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const reviews = await listReviews(id);
  return successResponse(reviews);
});

export const POST = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  const payload = await parseBody(request, reviewSchema);
  const review = await createReview(user, id, payload);
  return successResponse(review, "Review submitted");
});
