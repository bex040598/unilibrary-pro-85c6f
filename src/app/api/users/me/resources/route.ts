import { successResponse, withRoute } from "@/lib/api/response";
import { requireUser } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export const GET = withRoute(async () => {
  const user = await requireUser();

  if (["TEACHER", "LIBRARIAN", "ADMIN", "MODERATOR", "DEPARTMENT_HEAD"].includes(user.role)) {
    const resources = await prisma.resource.findMany({
      where: { uploadedById: user.id },
      include: {
        category: true,
        department: true
      },
      orderBy: { createdAt: "desc" }
    });

    return successResponse(resources);
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      resource: {
        include: {
          category: true,
          department: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return successResponse(favorites.map((item) => item.resource));
});
