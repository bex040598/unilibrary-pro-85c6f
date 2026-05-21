import { prisma } from "@/lib/db/prisma";
import { getDatabaseDiagnostics } from "@/lib/db/database-url";

export async function getDatabaseHealth() {
  const diagnostics = getDatabaseDiagnostics();

  if (!diagnostics.configured) {
    return {
      ok: false,
      diagnostics,
      error: diagnostics.hint ?? "Database is not configured"
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      ok: true,
      diagnostics,
      error: null
    };
  } catch (error) {
    return {
      ok: false,
      diagnostics,
      error: error instanceof Error ? error.message : "Database connection failed"
    };
  }
}
