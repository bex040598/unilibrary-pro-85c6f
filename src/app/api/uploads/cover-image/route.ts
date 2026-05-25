import { successResponse, withRoute } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { uploadResourceAsset } from "@/server/services/upload-service";

export const POST = withRoute(async (request: Request) => {
  const user = await requireRole(["LIBRARIAN", "TEACHER", "ADMIN"]);
  const formData = await request.formData();
  const file = formData.get("file") ?? formData.get("coverImage");
  const stored = await uploadResourceAsset(user, file instanceof File ? file : null, "cover-image");
  return successResponse(stored, "Muqova rasmi yuklandi");
});
