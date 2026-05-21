import { PrismaClient } from "@prisma/client";

import { getDatabaseDiagnostics, normalizeDatabaseUrl } from "@/lib/db/database-url";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const databaseUrl = normalizeDatabaseUrl() ?? undefined;
export const prismaDatabaseDiagnostics = getDatabaseDiagnostics(databaseUrl);
export const isDatabaseConfigured = prismaDatabaseDiagnostics.configured;

function createPrismaClient() {
  return new PrismaClient({
    ...(databaseUrl ? { datasourceUrl: databaseUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

export const prisma =
  globalThis.prismaGlobal ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
