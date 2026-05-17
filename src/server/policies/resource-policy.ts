import type { User } from "@prisma/client";

export function canManageResource(user: User, resourceOwnerId: string) {
  if (user.role === "ADMIN" || user.role === "LIBRARIAN" || user.role === "MODERATOR") {
    return true;
  }

  if (user.role === "TEACHER" && user.id === resourceOwnerId) {
    return true;
  }

  return false;
}

export function canAccessPrivateResource(user: User | null, accessType: string) {
  if (accessType === "PUBLIC") {
    return true;
  }

  if (!user) {
    return false;
  }

  if (user.role === "ADMIN" || user.role === "LIBRARIAN") {
    return true;
  }

  if (accessType === "AUTH_REQUIRED") {
    return true;
  }

  if (accessType === "STAFF_ONLY") {
    return ["ADMIN", "LIBRARIAN", "MODERATOR", "DEPARTMENT_HEAD", "TEACHER"].includes(user.role);
  }

  return false;
}
