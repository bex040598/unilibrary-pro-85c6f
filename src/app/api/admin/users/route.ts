import { paginatedResponse, withRoute } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { listAdminEntity } from "@/server/services/admin-crud-service";

export const GET = withRoute(async (request: Request) => {
  await requireRole(["ADMIN"]);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const q = url.searchParams.get("q") ?? undefined;
  const role = url.searchParams.get("role") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  const result = await listAdminEntity("users", { page, limit, q, role, status });
  return paginatedResponse(result.items as never[], result.meta.page, result.meta.limit, result.meta.total);
});
