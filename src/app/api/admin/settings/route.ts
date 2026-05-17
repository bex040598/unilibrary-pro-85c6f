import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { getSystemSettings, updateSystemSetting } from "@/server/services/admin-service";

const schema = z.object({
  key: z.string().min(1),
  value: z.unknown()
});

export const GET = withRoute(async () => {
  await requireRole(["ADMIN"]);
  const settings = await getSystemSettings();
  return successResponse(settings);
});

export const PUT = withRoute(async (request: Request) => {
  await requireRole(["ADMIN"]);
  const payload = await parseBody(request, schema);
  const setting = await updateSystemSetting(payload.key, payload.value);
  return successResponse(setting, "Setting updated");
});
