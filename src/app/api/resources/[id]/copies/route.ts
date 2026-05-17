import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { createCopy, listCopies } from "@/server/services/resource-service";

const schema = z.object({
  inventoryNumber: z.string().min(3),
  barcode: z.string().min(3),
  shelfLocation: z.string().optional()
});

export const GET = withRoute(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const copies = await listCopies(id);
  return successResponse(copies);
});

export const POST = withRoute(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const { id } = await context.params;
  const payload = await parseBody(request, schema);
  const copy = await createCopy(user, id, payload);
  return successResponse(copy, "Book copy created");
});
