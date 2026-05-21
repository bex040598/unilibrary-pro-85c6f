import { z } from "zod";

export const departmentQuerySchema = z.object({
  q: z.string().optional(),
  facultyId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12),
  includeInactive: z.enum(["true", "false"]).optional()
});

export const departmentInputSchema = z.object({
  facultyId: z.string().min(1),
  nameUz: z.string().min(2),
  nameRu: z.string().min(2),
  nameEn: z.string().min(2),
  slug: z.string().min(2),
  code: z.string().min(2).max(32).optional().or(z.literal("")),
  headName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  room: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional()
});

export type DepartmentQueryInput = z.infer<typeof departmentQuerySchema>;
export type DepartmentInput = z.infer<typeof departmentInputSchema>;
