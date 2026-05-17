import { z } from "zod";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().regex(passwordRule, "Password must contain upper, lower case letters and a number"),
  role: z.enum(["STUDENT", "TEACHER", "DEPARTMENT_HEAD", "LIBRARIAN", "MODERATOR", "ADMIN"]).default("STUDENT"),
  facultyId: z.string().optional(),
  departmentId: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().regex(passwordRule, "Password must contain upper, lower case letters and a number")
});
