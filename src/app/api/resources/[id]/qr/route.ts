import { withRoute, successResponse } from "@/lib/api/response";
import { getAppUrl } from "@/lib/app-url";
import { generateQrDataUrl } from "@/lib/qr";

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const dataUrl = await generateQrDataUrl(`${getAppUrl()}/api/resources/${id}`);
  return successResponse({ dataUrl });
});
