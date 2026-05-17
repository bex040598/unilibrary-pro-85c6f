const defaultAppUrl = "http://localhost:3000";

export function getAppUrl() {
  const rawUrl = process.env.APP_URL ?? process.env.RENDER_EXTERNAL_URL ?? defaultAppUrl;
  return rawUrl.replace(/\/+$/, "");
}
