import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import {
  getCurrentNutritionistId,
  isSameOrigin,
} from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { getAdminDb } from "@/lib/firebase/server";
import { validateReplacementGroup } from "@/lib/replacements/groups-mapping";

export const runtime = "nodejs";

function toIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return "";
    }
  }
  return typeof value === "string" ? value : "";
}

/** List the professional's replacement groups. */
export async function GET() {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const uid = await getCurrentNutritionistId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const snap = await getAdminDb()
    .collection(`nutritionists/${uid}/replacementGroups`)
    .orderBy("name")
    .get();

  const groups = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      nutritionistId: uid,
      name: typeof d.name === "string" ? d.name : "",
      role: d.role,
      tolerance: d.tolerance,
      members: Array.isArray(d.members) ? d.members : [],
      createdAt: toIso(d.createdAt),
      updatedAt: toIso(d.updatedAt),
    };
  });
  return NextResponse.json({ groups });
}

/** Create or update one replacement group (owned by the verified UID). */
export async function PUT(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const uid = await getCurrentNutritionistId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const result = validateReplacementGroup(body);
  if (!result.ok) {
    return NextResponse.json({ error: "invalid", detail: result.error }, { status: 400 });
  }

  const { id, name, role, tolerance, members } = result.group;
  const ref = getAdminDb().doc(`nutritionists/${uid}/replacementGroups/${id}`);
  const existed = (await ref.get()).exists;
  const now = FieldValue.serverTimestamp();
  await ref.set(
    {
      id,
      nutritionistId: uid,
      name,
      role,
      tolerance,
      members,
      updatedAt: now,
      ...(existed ? {} : { createdAt: now }),
    },
    { merge: true },
  );
  return NextResponse.json({ ok: true, id });
}

/** Delete one replacement group. */
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const uid = await getCurrentNutritionistId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  await getAdminDb().doc(`nutritionists/${uid}/replacementGroups/${id}`).delete();
  return NextResponse.json({ ok: true });
}
