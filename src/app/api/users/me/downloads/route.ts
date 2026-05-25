import { successResponse, withRoute } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export const GET = withRoute(async () => {
  const user = await requireUser();
  const downloads = await prisma.downloadLog.findMany({
    where: { userId: user.id },
    include: { resource: { include: { category: true, department: true } } },
    orderBy: { createdAt: "desc" }
  });
  return successResponse(downloads);
});
