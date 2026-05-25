import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import { getAppUrl } from "@/lib/app-url";
import type { Role } from "@/lib/constants";

const AUTH_COOKIE_NAME = "atmu_session";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
};

function getSecret() {
  const secret = process.env.JWT_SECRET ?? process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET or AUTH_SECRET must be configured");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_COOKIE_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as SessionPayload;
}

export function getAuthCookieOptions() {
  const appUrl = getAppUrl();
  const isLocalHttp = appUrl.startsWith("http://localhost") || appUrl.startsWith("http://127.0.0.1");
  const sameSite = (process.env.COOKIE_SAME_SITE ?? "lax").toLowerCase();
  const forceSecure = process.env.COOKIE_SECURE === "true";

  return {
    httpOnly: true,
    sameSite: (sameSite === "strict" ? "strict" : sameSite === "none" ? "none" : "lax") as "lax" | "strict" | "none",
    secure: forceSecure || (process.env.NODE_ENV === "production" && !isLocalHttp),
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE
  };
}

export async function getSessionFromCookies() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export const authCookieName = AUTH_COOKIE_NAME;
