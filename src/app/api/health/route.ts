import { withRoute, successResponse } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export const GET = withRoute(async () => {
  await prisma.$queryRaw`SELECT 1`;

  return successResponse({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});
