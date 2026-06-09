import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  isSameOrigin,
  mintSessionCookie,
  sessionCookieOptions,
} from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured } from "@/lib/env";

export const runtime = "nodejs";

/** Exchange a Firebase ID token for an httpOnly session cookie. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let idToken = "";
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && "idToken" in body) {
      const value = (body as { idToken: unknown }).idToken;
      if (typeof value === "string") idToken = value;
    }
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!idToken) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const cookie = await mintSessionCookie(idToken);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}

/** Clear the session cookie on sign-out. */
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
