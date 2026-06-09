import "server-only";

import { getAdminDb } from "@/lib/firebase/server";
import { docsToBuilderState } from "@/lib/professional/firestore-mapping";
import type { BuilderState } from "@/lib/professional/types";

/**
 * Read the professional's current saved plan (single patient + plan for MVP-6)
 * as a BuilderState, or null if none. The caller must already have resolved
 * `uid` from the verified session cookie — this only reads under
 * nutritionists/{uid}. Shared by GET /api/plan and the assistant route.
 */
export async function readSavedPlan(uid: string): Promise<BuilderState | null> {
  const db = getAdminDb();

  const patientsSnap = await db
    .collection(`nutritionists/${uid}/patients`)
    .orderBy("updatedAt", "desc")
    .limit(1)
    .get();
  if (patientsSnap.empty) return null;

  const patientDoc = patientsSnap.docs[0]!;
  const plansSnap = await patientDoc.ref
    .collection("plans")
    .orderBy("updatedAt", "desc")
    .limit(1)
    .get();
  if (plansSnap.empty) return null;

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

  return docsToBuilderState(uid, patientDoc.data(), planDoc.data(), meals);
}
