import { PrismaClient } from "@prisma/client";

import { normalizeDatabaseUrl } from "@/lib/db/database-url";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    datasourceUrl: normalizeDatabaseUrl() ?? undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
