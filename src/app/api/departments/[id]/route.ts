import { withRoute, parseBody, successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { departmentInputSchema } from "@/lib/validation/department";
import { archiveDepartment, getDepartmentById, updateDepartment } from "@/server/services/department-service";

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const department = await getDepartmentById(id);
  return successResponse(department);
});

export const PATCH = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["ADMIN", "LIBRARIAN"]);
  const { id } = await context.params;
  const payload = await parseBody(request, departmentInputSchema);
  const department = await updateDepartment(id, payload, user.id);
  return successResponse(department, "Kafedra yangilandi");
});

export const DELETE = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["ADMIN"]);
  const { id } = await context.params;
  const department = await archiveDepartment(id, user.id);
  return successResponse(department, "Kafedra faolsiz holatga o'tkazildi");
});
