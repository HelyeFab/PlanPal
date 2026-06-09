import { NextResponse } from "next/server";

import {
  getCurrentNutritionistId,
  isSameOrigin,
} from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { readSavedPlan } from "@/lib/professional/read-plan";
import { findReplacements } from "@/lib/replacements/engine";
import { readReplacementGroups } from "@/lib/replacements/read-groups";
import type { FoodReplacementRequest } from "@planpal/shared";

export const runtime = "nodejs";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Deterministic replacement engine (MVP-8b, ADR-015). Professional-only:
 * verify session cookie → load the owned saved plan + replacement groups →
 * run the pure engine → return a structured ReplacementResult. No OpenAI.
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
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const mealId = str(b.mealId);
  const foodSlotId = str(b.foodSlotId);
  const optionId = str(b.optionId) || undefined;
  const originalFoodName = str(b.originalFoodName);
  if (!mealId || !foodSlotId) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const plan = await readSavedPlan(uid);
  if (!plan || !plan.planId) {
    return NextResponse.json({ noPlan: true });
  }

  const groups = await readReplacementGroups(uid);
  const replacementRequest: FoodReplacementRequest = {
    planId: plan.planId,
    mealId,
    foodSlotId,
    optionId,
    originalFoodName,
  };
  const result = findReplacements(plan, groups, replacementRequest);
  return NextResponse.json({ result });
}
