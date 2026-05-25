import type { Role } from "@/lib/constants";

export function getRoleDashboardPath(locale: string, role: string) {
  const normalizedRole = role.toUpperCase() as Role;

  switch (normalizedRole) {
    case "ADMIN":
      return `/${locale}/admin/dashboard`;
    case "LIBRARIAN":
      return `/${locale}/librarian`;
    case "MODERATOR":
      return `/${locale}/moderator`;
    case "STUDENT":
      return `/${locale}/cabinet`;
    case "TEACHER":
      return `/${locale}/teacher`;
    case "DEPARTMENT_HEAD":
      return `/${locale}/department-head`;
    default:
      return `/${locale}/auth/login`;
  }
}

export function getDefaultRoleSegments() {
  return ["student", "librarian", "admin", "moderator"] as const;
}
