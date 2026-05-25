export const appName = "ATMU Smart UniLibrary Enterprise";
export const defaultLocale = "uz";
export const locales = ["uz", "ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const roles = [
  "ADMIN",
  "LIBRARIAN",
  "MODERATOR",
  "DEPARTMENT_HEAD",
  "TEACHER",
  "STUDENT",
  "GUEST"
] as const;

export type Role = (typeof roles)[number];

export const userStatuses = ["ACTIVE", "BLOCKED", "PENDING", "ARCHIVED"] as const;
export const languages = ["UZ", "RU", "EN"] as const;
export const accessTypes = ["PUBLIC", "AUTH_REQUIRED", "STAFF_ONLY", "PRIVATE"] as const;
export const resourceTypes = [
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
] as const;
export const resourceStatuses = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "NEEDS_REVISION",
  "ARCHIVED"
] as const;
export const bookCopyStatuses = ["AVAILABLE", "RESERVED", "BORROWED", "LOST", "MAINTENANCE"] as const;
export const reservationStatuses = ["PENDING", "APPROVED", "REJECTED", "PICKED_UP", "EXPIRED", "CANCELLED"] as const;
export const loanStatuses = ["ACTIVE", "RETURNED", "OVERDUE", "EXTENDED", "LOST"] as const;
export const renewalStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;
export const seatStatuses = ["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"] as const;
export const seatReservationStatuses = ["BOOKED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
export const reviewStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;

export const roleRouteAccess: Record<string, Role[]> = {
  student: ["STUDENT"],
  cabinet: ["STUDENT"],
  teacher: ["TEACHER", "ADMIN"],
  "department-head": ["DEPARTMENT_HEAD", "ADMIN"],
  librarian: ["LIBRARIAN", "ADMIN"],
  moderator: ["MODERATOR", "ADMIN"],
  admin: ["ADMIN"]
};

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrator",
  LIBRARIAN: "Kutubxonachi",
  MODERATOR: "Moderator",
  DEPARTMENT_HEAD: "Kafedra mudiri",
  TEACHER: "O'qituvchi",
  STUDENT: "Talaba",
  GUEST: "Mehmon"
};
