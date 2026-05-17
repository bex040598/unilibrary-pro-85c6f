export function normalizeQuery(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildContains(value: string) {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (databaseUrl.startsWith("file:")) {
    return {
      contains: value
    };
  }

  return {
    contains: value,
    mode: "insensitive" as const
  };
}
