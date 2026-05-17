export function normalizeQuery(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildContains(value: string) {
  return {
    contains: value,
    mode: "insensitive" as const
  };
}
