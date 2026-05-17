export function getRequestMeta(request: Request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
    userAgent: request.headers.get("user-agent") ?? "unknown"
  };
}
