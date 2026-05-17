import { z } from "zod";

export const resourceInputSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
  subject: z.string().optional(),
  categoryId: z.string().min(1),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  language: z.enum(["UZ", "RU", "EN"]).default("UZ"),
  publicationYear: z.coerce.number().int().min(1900).max(2100).optional(),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  udk: z.string().optional(),
  bbk: z.string().optional(),
  pages: z.coerce.number().int().positive().optional(),
  resourceType: z
    .enum([
      "TEXTBOOK",
      "STUDY_GUIDE",
      "MONOGRAPH",
      "ARTICLE",
      "DISSERTATION",
      "ABSTRACT",
      "METHODICAL_GUIDE",
      "LAB_WORK",
      "PRESENTATION",
      "VIDEO",
      "OTHER"
    ])
    .default("TEXTBOOK"),
  accessType: z.enum(["PUBLIC", "AUTH_REQUIRED", "STAFF_ONLY", "PRIVATE"]).default("PUBLIC"),
  authorIds: z.array(z.string()).default([]),
  authorNames: z.array(z.string()).default([])
});

export const resourceQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  language: z.enum(["UZ", "RU", "EN"]).optional(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  resourceType: z.string().optional(),
  accessType: z.string().optional(),
  hasAvailableCopies: z.enum(["true", "false"]).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  sort: z.enum(["latest", "popular", "downloads", "rating", "year"]).default("latest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12)
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3).max(500).optional()
});
