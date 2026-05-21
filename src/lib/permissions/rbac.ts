import { redirect } from "next/navigation";

import type { Role } from "@/lib/constants";
import { defaultLocale, roleRouteAccess } from "@/lib/constants";
import { AppError } from "@/lib/errors/app-error";
import { getSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getRoleDashboardPath } from "@/lib/role-dashboard";

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.sub }
  });
}

export function assertRole(role: string, allowed: Role[]) {
  if (!allowed.includes(role as Role)) {
    throw new AppError("FORBIDDEN", "You do not have access to this resource", 403);
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("UNAUTHORIZED", "Authentication required", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("FORBIDDEN", "Account is not active", 403);
  }

  return user;
}

export async function requireRole(allowed: Role[]) {
  const user = await requireUser();
  assertRole(user.role, allowed);
  return user;
}

export async function requirePageRole(segment: keyof typeof roleRouteAccess, locale = defaultLocale) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  if (!roleRouteAccess[segment].includes(user.role as Role)) {
    redirect(getRoleDashboardPath(locale, user.role));
  }

  return user;
}

export function assertOwnership(ownerId: string, userId: string) {
  if (ownerId !== userId) {
    throw new AppError("OWNERSHIP_REQUIRED", "Ownership check failed", 403);
  }
}
