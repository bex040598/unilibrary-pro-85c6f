import { withRoute, successResponse } from "@/lib/api/response";
import { getDepartmentBySlug } from "@/server/services/department-service";

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
  const { slug } = await context.params;
  const department = await getDepartmentBySlug(slug);
  return successResponse(department);
});
