import { z } from "zod";

export const reservationSchema = z.object({
  resourceId: z.string().min(1),
  pickupDate: z.string().datetime()
});

export const renewalRequestSchema = z.object({
  requestedDueAt: z.string().datetime()
});
