import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale } from "@/lib/constants";
import { securityHeaders } from "@/lib/security/headers";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    const response = NextResponse.redirect(url);
    Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }

  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
