import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authCookieName, verifySessionToken } from "@/lib/auth/session";
import { defaultLocale, locales, roleRouteAccess, type Role } from "@/lib/constants";
import { getRoleDashboardPath } from "@/lib/role-dashboard";
import { securityHeaders } from "@/lib/security/headers";

function withSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  const hasLocale = locales.includes((segments[0] ?? "") as (typeof locales)[number]);
  const locale = hasLocale ? segments[0] : defaultLocale;
  const protectedSegmentIndex = hasLocale ? 1 : 0;
  const protectedSegment = segments[protectedSegmentIndex];

  if (!hasLocale && protectedSegment && protectedSegment in roleRouteAccess) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}/${segments.join("/")}`;
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  if (protectedSegment && protectedSegment in roleRouteAccess) {
    const token = request.cookies.get(authCookieName)?.value;

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/auth/login`;
      return withSecurityHeaders(NextResponse.redirect(url));
    }

    try {
      const session = await verifySessionToken(token);
      const allowedRoles = roleRouteAccess[protectedSegment];

      if (!allowedRoles.includes(session.role as Role)) {
        const url = request.nextUrl.clone();
        url.pathname = getRoleDashboardPath(locale, session.role);
        return withSecurityHeaders(NextResponse.redirect(url));
      }
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/auth/login`;
      return withSecurityHeaders(NextResponse.redirect(url));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
