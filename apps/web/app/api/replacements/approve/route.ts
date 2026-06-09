import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import {
  getCurrentNutritionistId,
  isSameOrigin,
} from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { getAdminDb } from "@/lib/firebase/server";
import { readSavedPlan } from "@/lib/professional/read-plan";
import { validateApproval } from "@/lib/replacements/approve";

export const runtime = "nodejs";

/**
 * Approve a replacement candidate into the plan (MVP-9, ADR-016). Focused write:
 * verify session cookie → load the owned plan → locate the slot → de-dup by food
 * name → append ONE approved FoodOption (with provenance) to that slot. Writes
 * only the affected slot doc + plan.updatedAt. UID always from the cookie.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const uid = await getCurrentNutritionistId();
  if (!uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const result = validateApproval(body);
  if (!result.ok) {
    return NextResponse.json({ error: "invalid", detail: result.error }, { status: 400 });
  }
  const { mealId, foodSlotId, option, provenance } = result.value;

  const plan = await readSavedPlan(uid);
  if (!plan || !plan.planId) {
    return NextResponse.json({ error: "no_plan" }, { status: 400 });
  }

  // Confirm the meal/slot exist in the owned plan.
  const meal = plan.meals.find((m) => m.id === mealId);
  const slot = meal?.slots.find((s) => s.id === foodSlotId);
  if (!meal || !slot) {
    return NextResponse.json({ error: "slot_not_found" }, { status: 404 });
  }

  const db = getAdminDb();
  const slotRef = db.doc(
    `nutritionists/${uid}/patients/${plan.patientId}/plans/${plan.planId}/meals/${mealId}/slots/${foodSlotId}`,
  );
  const planRef = db.doc(
    `nutritionists/${uid}/patients/${plan.patientId}/plans/${plan.planId}`,
  );

  const slotSnap = await slotRef.get();
  const existing = Array.isArray(slotSnap.data()?.options)
    ? (slotSnap.data()!.options as Array<Record<string, unknown>>)
    : [];

  const wanted = option.foodName.trim().toLowerCase();
  if (existing.some((o) => String(o.foodName ?? "").trim().toLowerCase() === wanted)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const optionId = `option_${crypto.randomUUID()}`;
  const newOption = {
    id: optionId,
    foodName: option.foodName,
    quantity: option.quantity,
    unit: option.unit,
    notes: option.notes,
    isDefault: false,
    ...(option.role ? { role: option.role } : {}),
    ...(option.nutrition ? { nutrition: option.nutrition } : {}),
    ...(option.replacementGroupId
      ? { replacementGroupId: option.replacementGroupId }
      : {}),
    approvedFromCandidate: {
      source: provenance.source,
      classification: provenance.classification,
      confidence: provenance.confidence,
      approvedAt: new Date().toISOString(),
    },
  };

  const now = FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.set(slotRef, { options: [...existing, newOption], updatedAt: now }, { merge: true });
  batch.set(planRef, { updatedAt: now }, { merge: true });
  await batch.commit();

  return NextResponse.json({ ok: true, optionId });
}
