import { readLocalStoredFile, saveLocalUpload } from "@/lib/storage/local-storage";
import { getS3SignedReadUrl, saveS3Upload } from "@/lib/storage/s3-storage";

export type StoredUpload = {
  storageKey: string;
  checksum: string;
  size: number;
  format: string;
  filepath?: string;
  validationReport: {
    filename: string;
    mimeType: string;
    extensionAccepted: boolean;
    mimeAccepted: boolean;
    magicNumberAccepted: boolean;
    antivirusStatus: string;
  };
};

export function getStorageProvider() {
  return process.env.STORAGE_PROVIDER === "s3" ? "s3" : "local";
}

export async function saveUpload(file: File): Promise<StoredUpload> {
  if (getStorageProvider() === "s3") {
    return saveS3Upload(file);
  }

  return saveLocalUpload(file);
}

export async function getProtectedFileAccess(storageKey: string, download = false) {
  if (getStorageProvider() === "s3") {
    return {
      type: "redirect" as const,
      signedUrl: await getS3SignedReadUrl(storageKey, download)
    };
  }

  const local = await readLocalStoredFile(storageKey);
  return {
    type: "buffer" as const,
    buffer: local.buffer,
    filepath: local.filepath
  };
}
