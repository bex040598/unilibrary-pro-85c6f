import { z } from "zod";

import { withRoute, successResponse, parseBody } from "@/lib/api/response";
import { requireRole } from "@/lib/permissions/rbac";
import { createReadingRoom, listReadingRooms } from "@/server/services/reading-room-service";

const schema = z.object({
  name: z.string().min(2),
  floor: z.string().min(1),
  capacity: z.number().int().positive(),
  openingTime: z.string().min(1),
  closingTime: z.string().min(1)
});

export const GET = withRoute(async () => {
  const rooms = await listReadingRooms();
  return successResponse(rooms);
});

export const POST = withRoute(async (request: Request) => {
  const user = await requireRole(["LIBRARIAN", "ADMIN"]);
  const payload = await parseBody(request, schema);
  const room = await createReadingRoom(user, payload);
  return successResponse(room, "Reading room created");
});
