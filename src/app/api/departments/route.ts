import { withRoute, paginatedResponse, parseBody, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { departmentInputSchema, departmentQuerySchema } from "@/lib/validation/department";
import { createDepartment, listDepartments } from "@/server/services/department-service";

export const GET = withRoute(async (request: Request) => {
  const query = departmentQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));
  const result = await listDepartments(query);
  return paginatedResponse(result.items, result.meta.page, result.meta.limit, result.meta.total);
});

export const POST = withRoute(async (request: Request) => {
  const user = await requireRole(["ADMIN", "LIBRARIAN"]);
  const payload = await parseBody(request, departmentInputSchema);
  const department = await createDepartment(payload, user.id);
  return successResponse(department, "Kafedra yaratildi");
});
