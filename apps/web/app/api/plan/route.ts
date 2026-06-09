import { FieldValue, type QueryDocumentSnapshot } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import {
  getCurrentNutritionistId,
  isSameOrigin,
} from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { getAdminDb } from "@/lib/firebase/server";
import {
  builderStateToDocs,
  docsToBuilderState,
  validateBuilderState,
} from "@/lib/professional/firestore-mapping";

export const runtime = "nodejs";

/**
 * Load the professional's current plan (single patient + plan for MVP-6).
 * The UID comes from the verified session cookie; data is read with the Admin
 * SDK scoped to nutritionists/{uid}.
 */
export async function GET() {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const uid = await getCurrentNutritionistId();
  if (!uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const patientsSnap = await db
    .collection(`nutritionists/${uid}/patients`)
    .orderBy("updatedAt", "desc")
    .limit(1)
    .get();
  if (patientsSnap.empty) return NextResponse.json({ plan: null });

  const patientDoc = patientsSnap.docs[0]!;
  const plansSnap = await patientDoc.ref
    .collection("plans")
    .orderBy("updatedAt", "desc")
    .limit(1)
    .get();
  if (plansSnap.empty) return NextResponse.json({ plan: null });

  const planDoc = plansSnap.docs[0]!;
  const mealsSnap = await planDoc.ref
    .collection("meals")
    .orderBy("sortOrder")
    .get();

  const meals = [];
  for (const mealDoc of mealsSnap.docs) {
    const slotsSnap = await mealDoc.ref
      .collection("slots")
      .orderBy("sortOrder")
      .get();
    meals.push({
      data: mealDoc.data(),
      slots: slotsSnap.docs.map((d) => d.data()),
    });
  }

  const state = docsToBuilderState(
    uid,
    patientDoc.data(),
    planDoc.data(),
    meals,
  );
  return NextResponse.json({ plan: state });
}

/**
 * Upsert the professional's current plan tree, deleting any meals/slots that
 * were removed in the builder (no zombie documents). Ownership is the verified
 * cookie UID; any client-sent nutritionistId is ignored.
 */
export async function PUT(request: Request) {
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

  const result = validateBuilderState(body);
  if (!result.ok) {
    return NextResponse.json(
      { error: "invalid", detail: result.error },
      { status: 400 },
    );
  }

  const state = result.state;
  const docs = builderStateToDocs(state, uid);
  const db = getAdminDb();
  const now = FieldValue.serverTimestamp();

  const patientRef = db.doc(
    `nutritionists/${uid}/patients/${state.patientId}`,
  );
  const planRef = patientRef.collection("plans").doc(state.planId);
  const mealsCol = planRef.collection("meals");

  // Read existing tree (for created-vs-updated + deletion diffing).
  const [patientSnap, planSnap, existingMealsSnap] = await Promise.all([
    patientRef.get(),
    planRef.get(),
    mealsCol.get(),
  ]);
  const existingMeals = existingMealsSnap.docs;
  const existingSlotsByMeal: Record<string, QueryDocumentSnapshot[]> = {};
  for (const meal of existingMeals) {
    const slotsSnap = await meal.ref.collection("slots").get();
    existingSlotsByMeal[meal.id] = slotsSnap.docs;
  }

  const batch = db.batch();
  const stamp = (existed: boolean) =>
    existed ? { updatedAt: now } : { createdAt: now, updatedAt: now };

  batch.set(patientRef, { ...docs.patient, ...stamp(patientSnap.exists) }, {
    merge: true,
  });
  batch.set(planRef, { ...docs.plan, ...stamp(planSnap.exists) }, {
    merge: true,
  });

  const submittedMealIds = new Set(docs.meals.map((m) => m.id));
  const existingMealIds = new Set(existingMeals.map((m) => m.id));

  for (const meal of docs.meals) {
    const { slots, ...mealData } = meal;
    const mealRef = mealsCol.doc(meal.id);
    batch.set(
      mealRef,
      { ...mealData, ...stamp(existingMealIds.has(meal.id)) },
      { merge: true },
    );

    const existingSlots = existingSlotsByMeal[meal.id] ?? [];
    const existingSlotIds = new Set(existingSlots.map((s) => s.id));
    const submittedSlotIds = new Set(slots.map((s) => s.id));

    for (const slot of slots) {
      batch.set(
        mealRef.collection("slots").doc(slot.id),
        { ...slot, ...stamp(existingSlotIds.has(slot.id)) },
        { merge: true },
      );
    }
    // Delete slots removed from a retained meal.
    for (const slot of existingSlots) {
      if (!submittedSlotIds.has(slot.id)) batch.delete(slot.ref);
    }
  }

  // Delete removed meals and their slots (Firestore does not cascade).
  for (const meal of existingMeals) {
    if (!submittedMealIds.has(meal.id)) {
      for (const slot of existingSlotsByMeal[meal.id] ?? []) {
        batch.delete(slot.ref);
      }
      batch.delete(meal.ref);
    }
  }

  await batch.commit();
  return NextResponse.json({
    ok: true,
    patientId: state.patientId,
    planId: state.planId,
  });
}
