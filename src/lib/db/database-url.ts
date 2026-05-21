const defaultAppUrl = "http://localhost:3000";

type DatabaseDiagnostics = {
  configured: boolean;
  provider: "postgresql" | "sqlite" | "unknown";
  host: string | null;
  database: string | null;
  render: boolean;
  usesSslMode: boolean;
  hint: string | null;
};

export function getAppBaseUrl() {
  const rawUrl = process.env.APP_URL ?? process.env.RENDER_EXTERNAL_URL ?? defaultAppUrl;
  return rawUrl.replace(/\/+$/, "");
}

export function normalizeDatabaseUrl(rawUrl = process.env.DATABASE_URL) {
  if (!rawUrl) {
    return null;
  }

  if (rawUrl.startsWith("postgres://")) {
    return rawUrl.replace(/^postgres:\/\//, "postgresql://");
  }

  return rawUrl;
}

export function getDatabaseDiagnostics(rawUrl = process.env.DATABASE_URL): DatabaseDiagnostics {
  const normalized = normalizeDatabaseUrl(rawUrl);

  if (!normalized) {
    return {
      configured: false,
      provider: "unknown",
      host: null,
      database: null,
      render: process.env.RENDER === "true",
      usesSslMode: false,
      hint: "DATABASE_URL is not configured"
    };
  }

  if (normalized.startsWith("file:")) {
    return {
      configured: true,
      provider: "sqlite",
      host: null,
      database: normalized.replace(/^file:/, ""),
      render: process.env.RENDER === "true",
      usesSslMode: false,
      hint: process.env.RENDER === "true" ? "Render runtime is using SQLite fallback" : null
    };
  }

  try {
    const url = new URL(normalized);
    return {
      configured: true,
      provider: url.protocol.startsWith("postgres") ? "postgresql" : "unknown",
      host: url.hostname || null,
      database: url.pathname.replace(/^\//, "") || null,
      render: process.env.RENDER === "true",
      usesSslMode: Boolean(url.searchParams.get("sslmode")),
      hint: null
    };
  } catch {
    return {
      configured: false,
      provider: "unknown",
      host: null,
      database: null,
      render: process.env.RENDER === "true",
      usesSslMode: false,
      hint: "DATABASE_URL is malformed"
    };
  }
}
