import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().max(40).nullable().optional(),
  avatar: z.string().max(255).nullable().optional()
});
