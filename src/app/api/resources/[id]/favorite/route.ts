import { withRoute, successResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { toggleFavorite } from "@/server/services/resource-service";

export const POST = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  await toggleFavorite(user.id, id, true);
  return successResponse({}, "Favorite added");
});

export const DELETE = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  await toggleFavorite(user.id, id, false);
  return successResponse({}, "Favorite removed");
});
