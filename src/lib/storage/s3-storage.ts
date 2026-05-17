import crypto from "node:crypto";
import path from "node:path";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { validateUpload } from "@/lib/storage/local-storage";

function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials:
      process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
          }
        : undefined
  });
}

function getBucket() {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("S3_BUCKET must be configured when STORAGE_PROVIDER=s3");
  }

  return bucket;
}

export async function saveS3Upload(file: File) {
  const { ext, buffer, report } = await validateUpload(file);
  const key = `resources/${crypto.randomUUID()}${ext}`;
  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        checksum,
        originalName: path.basename(file.name)
      }
    })
  );

  return {
    storageKey: key,
    checksum,
    size: buffer.byteLength,
    format: ext.replace(".", "").toUpperCase(),
    validationReport: report
  };
}

export async function getS3SignedReadUrl(storageKey: string, download = false) {
  return getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: storageKey,
      ResponseContentDisposition: download ? "attachment" : "inline"
    }),
    { expiresIn: 60 * 5 }
  );
}
