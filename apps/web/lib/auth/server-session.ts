import "server-only";

import { cookies } from "next/headers";

import { isFirebaseAdminConfigured } from "@/lib/env";
import { getAdminAuth } from "@/lib/firebase/server";

/**
 * Server session helpers (ADR-011).
 *
 * The Firebase ID token from the client is exchanged for an httpOnly session
 * cookie, verified server-side with the Admin SDK. The UID resolved here — never
 * a client-supplied value — is the authoritative `nutritionistId`.
 */
export const SESSION_COOKIE = "planpal_session";
const SESSION_EXPIRES_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

/** Cookie options. Secure only in production (so localhost http works); Lax + httpOnly always. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_EXPIRES_MS / 1000,
  };
}

/** Verify the session cookie and return the professional UID, or null. */
export async function getCurrentNutritionistId(): Promise<string | null> {
  if (!isFirebaseAdminConfigured()) return null;
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(value, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

/** Verify the ID token, then mint a session cookie string. Throws if invalid. */
export async function mintSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  await auth.verifyIdToken(idToken);
  return auth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_MS });
}

/**
 * Same-origin guard for mutation routes (CSRF mitigation for MVP, alongside
 * SameSite=Lax — see docs/SECURITY_BOUNDARIES.md). Mutations must carry a
 * matching Origin header.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
