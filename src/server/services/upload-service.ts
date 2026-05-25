import type { User } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import { saveUpload } from "@/lib/storage/storage-service";
import { writeAuditLog } from "@/server/services/audit-service";

export async function uploadResourceAsset(
  user: User,
  file: File | null,
  kind: "resource-file" | "cover-image"
) {
  if (!file) {
    throw new AppError("VALIDATION_ERROR", "Yuklanadigan fayl topilmadi", 400);
  }

  const stored = await saveUpload(file);

  await writeAuditLog({
    userId: user.id,
    action: kind === "resource-file" ? "UPLOAD_RESOURCE_FILE" : "UPLOAD_COVER_IMAGE",
    entity: "Upload",
    entityId: stored.storageKey,
    newValue: {
      storageKey: stored.storageKey,
      format: stored.format,
      size: stored.size,
      checksum: stored.checksum,
      validationReport: stored.validationReport
    }
  });

  return stored;
}
