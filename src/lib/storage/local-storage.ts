import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { AppError } from "@/lib/errors/app-error";

export const allowedFileTypes = new Map<string, { mime: string[]; magic?: string[] }>([
  [".pdf", { mime: ["application/pdf"], magic: ["25504446"] }],
  [".docx", { mime: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] }],
  [".epub", { mime: ["application/epub+zip"] }],
  [".jpg", { mime: ["image/jpeg"], magic: ["ffd8ff"] }],
  [".jpeg", { mime: ["image/jpeg"], magic: ["ffd8ff"] }],
  [".png", { mime: ["image/png"], magic: ["89504e47"] }]
]);

const maxUploadSize = Number(process.env.MAX_UPLOAD_SIZE ?? 10 * 1024 * 1024);

function getBufferSignature(buffer: Buffer) {
  return buffer.subarray(0, 8).toString("hex");
}

export async function ensureUploadDir() {
  const target = process.env.UPLOAD_DIR ?? "./storage/uploads";
  await mkdir(target, { recursive: true });
  return path.resolve(target);
}

export async function validateUpload(file: File) {
  if (file.size > maxUploadSize) {
    throw new AppError("FILE_TOO_LARGE", "File exceeds the maximum allowed size", 400);
  }

  const ext = path.extname(file.name).toLowerCase();
  const allowed = allowedFileTypes.get(ext);
  if (!allowed || !allowed.mime.includes(file.type)) {
    throw new AppError("INVALID_FILE_TYPE", "Unsupported file type", 400, {
      filename: file.name,
      type: file.type
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const magicNumberAccepted = !allowed.magic || allowed.magic.some((magic) => getBufferSignature(buffer).startsWith(magic));

  if (!magicNumberAccepted) {
    throw new AppError("INVALID_FILE_TYPE", "Magic number validation failed", 400);
  }

  return {
    ext,
    buffer,
    report: {
      filename: file.name,
      mimeType: file.type,
      extensionAccepted: true,
      mimeAccepted: true,
      magicNumberAccepted,
      antivirusStatus: "PLACEHOLDER"
    }
  };
}

export async function saveLocalUpload(file: File) {
  const uploadDir = await ensureUploadDir();
  const { ext, buffer, report } = await validateUpload(file);
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(uploadDir, filename);
  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

  await writeFile(filepath, buffer);

  const details = await stat(filepath);

  return {
    storageKey: filename,
    filepath,
    checksum,
    size: Number(details.size),
    format: ext.replace(".", "").toUpperCase(),
    validationReport: report
  };
}

export async function readLocalStoredFile(storageKey: string) {
  const resolvedPath = path.isAbsolute(storageKey)
    ? storageKey
    : path.join(await ensureUploadDir(), storageKey);
  const buffer = await readFile(resolvedPath);

  return {
    buffer,
    filepath: resolvedPath
  };
}
