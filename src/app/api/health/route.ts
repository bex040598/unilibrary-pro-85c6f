import { NextResponse } from "next/server";

import { withRoute } from "@/lib/api/response";
import { getDatabaseHealth } from "@/lib/db/database-health";

export const GET = withRoute(async () => {
  const health = await getDatabaseHealth();

  return NextResponse.json(
    {
      success: health.ok,
      data: {
        status: health.ok ? "ok" : "degraded",
        database: health.ok ? "connected" : "unavailable",
        diagnostics: {
          configured: health.diagnostics.configured,
          provider: health.diagnostics.provider,
          host: health.diagnostics.host,
          database: health.diagnostics.database,
          render: health.diagnostics.render,
          usesSslMode: health.diagnostics.usesSslMode,
          hint: health.diagnostics.hint
        },
        timestamp: new Date().toISOString()
      },
      message: health.ok ? "OK" : "Database unavailable",
      meta: {}
    },
    { status: health.ok ? 200 : 503 }
  );
});
