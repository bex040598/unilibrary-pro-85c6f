import { parseBody, successResponse, withRoute } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { updateSystemSetting } from "@/server/services/admin-service";
import { z } from "zod";

const maintenanceSchema = z.object({
  enabled: z.boolean(),
  message: z.string().optional()
});

export const POST = withRoute(async (request: Request) => {
  await requireRole(["ADMIN"]);
  const payload = await parseBody(request, maintenanceSchema);

  const setting = await updateSystemSetting("maintenanceMode", {
    enabled: payload.enabled,
    message: payload.message ?? null
  });

  return successResponse(setting, "Maintenance mode updated");
});
