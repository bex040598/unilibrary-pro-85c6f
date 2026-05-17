import { z } from "zod";

export const seatReservationSchema = z.object({
  roomId: z.string().min(1),
  seatId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime()
});
