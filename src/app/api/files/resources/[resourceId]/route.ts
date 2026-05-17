import { withRoute } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { getProtectedFileAccess } from "@/lib/storage/storage-service";
import { canAccessPrivateResource } from "@/server/policies/resource-policy";

function detectContentType(format?: string | null) {
  switch ((format ?? "").toLowerCase()) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "epub":
      return "application/epub+zip";
    default:
      return "application/octet-stream";
  }
}

export const GET = withRoute(async (request: Request, context: { params: Promise<{ resourceId: string }> }) => {
  const { resourceId } = await context.params;
  const user = await getCurrentUser();
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  });

  if (!resource || !resource.fileUrl) {
    throw new AppError("NOT_FOUND", "File not found", 404);
  }

  if (!canAccessPrivateResource(user, resource.accessType)) {
    throw new AppError("FORBIDDEN", "You do not have access to this file", 403);
  }

  const url = new URL(request.url);
  const isDownload = url.searchParams.get("download") === "1";
  const access = await getProtectedFileAccess(resource.fileUrl, isDownload);

  if (access.type === "redirect") {
    return Response.redirect(access.signedUrl, 302);
  }

  return new Response(access.buffer, {
    headers: {
      "Content-Type": detectContentType(resource.fileFormat),
      "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${resource.slug}.${(resource.fileFormat ?? "bin").toLowerCase()}"`
    }
  });
});
