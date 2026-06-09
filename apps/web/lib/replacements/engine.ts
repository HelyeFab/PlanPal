/**
 * Deterministic replacement engine (MVP-8b, ADR-013/014/015).
 *
 * Pure: (saved plan + owned replacement groups + request) → ReplacementResult.
 * NO OpenAI, no I/O, no randomness. Classification is grounded in stored macros,
 * food roles, and professional-defined groups. Missing data is handled safely
 * (never invented). The route forces ownership via the verified session UID.
 */
import {
  DEFAULT_REPLACEMENT_TOLERANCE,
  categoryToDefaultRole,
  type FoodReplacementCandidate,
  type FoodReplacementRequest,
  type FoodRole,
  type NutritionalProfile,
  type ReplacementClassification,
  type ReplacementConfidence,
  type ReplacementGroup,
  type ReplacementResult,
  type ReplacementTolerance,
} from "@planpal/shared";

import type {
  BuilderNutrition,
  BuilderOption,
  BuilderState,
} from "@/lib/professional/types";

const MACRO_KEYS = ["calories", "protein", "carbohydrates", "fat", "fibre"] as const;

/** Primary macro that defines a role's portion (used for quantity scaling). */
const PRIMARY_MACRO: Record<FoodRole, keyof NutritionalProfile> = {
  lean_protein: "protein",
  protein: "protein",
  carbohydrate: "carbohydrates",
  fat: "fat",
  vegetable: "calories",
  fruit: "calories",
  dairy: "calories",
  mixed: "calories",
  other: "calories",
};

const SIMILAR_REASON: Record<keyof NutritionalProfile, string> = {
  calories: "similar_calories",
  protein: "similar_protein",
  carbohydrates: "similar_carbohydrates",
  fat: "similar_fat",
  fibre: "similar_calories",
};

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function profileFromBuilder(n?: BuilderNutrition): NutritionalProfile {
  const p: NutritionalProfile = {};
  if (!n) return p;
  for (const k of MACRO_KEYS) {
    const v = n[k];
    if (typeof v === "number" && Number.isFinite(v)) p[k] = v;
  }
  return p;
}

/** A normalised candidate gathered before classification. */
type RawCandidate = {
  foodName: string;
  quantity?: number;
  unit?: string;
  nutrition: NutritionalProfile;
  role: FoodRole;
  replacementGroupId?: string;
  source: FoodReplacementCandidate["source"];
  sourceReason: string;
  tolerance: ReplacementTolerance;
  approved: boolean;
};

function locateOriginal(plan: BuilderState, request: FoodReplacementRequest) {
  const meal = plan.meals.find((m) => m.id === request.mealId);
  if (!meal) return null;
  const slot = meal.slots.find((s) => s.id === request.foodSlotId);
  if (!slot) return null;
  let option: BuilderOption | undefined = request.optionId
    ? slot.options.find((o) => o.id === request.optionId)
    : undefined;
  if (!option && request.originalFoodName) {
    const wanted = request.originalFoodName.trim().toLowerCase();
    option = slot.options.find((o) => o.foodName.trim().toLowerCase() === wanted);
  }
  if (!option) option = slot.options[0];
  if (!option) return null;
  return { meal, slot, option };
}

export function findReplacements(
  plan: BuilderState,
  groups: ReplacementGroup[],
  request: FoodReplacementRequest,
): ReplacementResult {
  const located = locateOriginal(plan, request);
  if (!located) return { candidates: [], insufficientData: true };
  const { slot, option } = located;

  const role: FoodRole = option.role ?? categoryToDefaultRole(slot.category);
  const originalNutrition = profileFromBuilder(option.nutrition);
  const primaryKey = PRIMARY_MACRO[role];
  const originalPrimary = num(originalNutrition[primaryKey]);

  // --- gather candidates (source order), de-duplicated by food name ---
  const seen = new Set<string>([option.foodName.trim().toLowerCase()]);
  const raw: RawCandidate[] = [];
  const add = (c: RawCandidate) => {
    const key = c.foodName.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    raw.push(c);
  };

  // 1. approved options already in the same slot
  for (const o of slot.options) {
    if (o.id === option.id) continue;
    add({
      foodName: o.foodName,
      quantity: o.quantity === "" ? undefined : o.quantity,
      unit: o.unit,
      nutrition: profileFromBuilder(o.nutrition),
      role: o.role ?? categoryToDefaultRole(slot.category),
      replacementGroupId: o.replacementGroupId,
      source: "approved_option",
      sourceReason: "approved_in_slot",
      tolerance: DEFAULT_REPLACEMENT_TOLERANCE,
      approved: true,
    });
  }

  // 2. explicitly assigned replacement group
  const explicitGroup = option.replacementGroupId
    ? groups.find((g) => g.id === option.replacementGroupId)
    : undefined;
  const addGroupMembers = (group: ReplacementGroup, reason: string) => {
    for (const m of group.members) {
      add({
        foodName: m.foodName,
        quantity: m.quantity,
        unit: m.unit,
        nutrition: m.nutrition ?? {},
        role: group.role,
        replacementGroupId: group.id,
        source: "replacement_group",
        sourceReason: reason,
        tolerance: group.tolerance ?? DEFAULT_REPLACEMENT_TOLERANCE,
        approved: false,
      });
    }
  };
  if (explicitGroup) addGroupMembers(explicitGroup, "same_replacement_group");

  // 3. groups matching the original role
  for (const group of groups) {
    if (group.id === explicitGroup?.id) continue;
    if (group.role === role) addGroupMembers(group, "same_role");
  }

  // 4. same-role options elsewhere in the saved plan
  for (const meal of plan.meals) {
    for (const s of meal.slots) {
      for (const o of s.options) {
        if (o.id === option.id) continue;
        const oRole = o.role ?? categoryToDefaultRole(s.category);
        if (oRole !== role) continue;
        add({
          foodName: o.foodName,
          quantity: o.quantity === "" ? undefined : o.quantity,
          unit: o.unit,
          nutrition: profileFromBuilder(o.nutrition),
          role: oRole,
          replacementGroupId: o.replacementGroupId,
          source: "same_role",
          sourceReason: "same_role",
          tolerance: DEFAULT_REPLACEMENT_TOLERANCE,
          approved: false,
        });
      }
    }
  }

  const candidates = raw.map((c) => classify(c, role, primaryKey, originalNutrition, originalPrimary));

  const rank = (c: FoodReplacementCandidate): number => {
    if (c.classification === "approved") return 0;
    if (c.classification === "nutritionally_similar") {
      return c.confidence === "high" ? 1 : 2;
    }
    if (c.classification === "needs_professional_review") return 3;
    return 4;
  };
  candidates.sort((a, b) => rank(a) - rank(b));

  return { candidates, insufficientData: candidates.length === 0 };
}

function classify(
  c: RawCandidate,
  role: FoodRole,
  primaryKey: keyof NutritionalProfile,
  originalNutrition: NutritionalProfile,
  originalPrimary: number | undefined,
): FoodReplacementCandidate {
  const reasons: string[] = [];
  const cautions: string[] = [];

  if (c.approved) {
    return {
      foodName: c.foodName,
      suggestedQuantity: c.quantity,
      unit: c.unit,
      classification: "approved",
      confidence: "high",
      reasons: ["approved_in_slot"],
      source: c.source,
      nutrition: c.nutrition,
      role: c.role,
      replacementGroupId: c.replacementGroupId,
    };
  }

  reasons.push(c.sourceReason);

  const candPrimary = num(c.nutrition[primaryKey]);
  if (originalPrimary === undefined) {
    reasons.push("missing_original_nutrition");
    return finish(c, "needs_professional_review", "low", reasons, cautions, undefined, c.nutrition);
  }
  if (candPrimary === undefined || candPrimary <= 0 || c.quantity === undefined) {
    reasons.push("missing_candidate_nutrition");
    return finish(c, "needs_professional_review", "low", reasons, cautions, undefined, c.nutrition);
  }

  // Scale the candidate to match the original's primary macro for the role.
  const scale = originalPrimary / candPrimary;
  const suggestedQuantity = Math.max(1, Math.round(c.quantity * scale));
  const scaled: NutritionalProfile = {};
  for (const k of MACRO_KEYS) {
    const v = num(c.nutrition[k]);
    if (v !== undefined) scaled[k] = v * scale;
  }
  reasons.push(SIMILAR_REASON[primaryKey]);

  let mildlyOutside = false;
  let grosslyOutside = false;

  // calories (percent tolerance)
  compareRelative(
    num(originalNutrition.calories),
    num(scaled.calories),
    c.tolerance.caloriesPercent / 100,
    "calories",
    reasons,
    cautions,
    (mild, gross) => {
      mildlyOutside ||= mild;
      grosslyOutside ||= gross;
    },
  );

  // secondary protein (only when protein is NOT the primary macro)
  if (primaryKey !== "protein") {
    compareRelative(
      num(originalNutrition.protein),
      num(scaled.protein),
      c.tolerance.proteinPercent / 100,
      "protein",
      reasons,
      cautions,
      (mild, gross) => {
        mildlyOutside ||= mild;
        grosslyOutside ||= gross;
      },
    );
  }

  // fat (absolute grams tolerance)
  compareAbsolute(
    num(originalNutrition.fat),
    num(scaled.fat),
    c.tolerance.fatGrams,
    reasons,
    cautions,
    (mild, gross) => {
      mildlyOutside ||= mild;
      grosslyOutside ||= gross;
    },
  );

  if (grosslyOutside) {
    cautions.push("outside_tolerance");
    return finish(c, "not_suitable", "low", reasons, cautions, suggestedQuantity, scaled);
  }
  if (mildlyOutside) {
    return finish(c, "needs_professional_review", "medium", reasons, cautions, suggestedQuantity, scaled);
  }
  const confidence: ReplacementConfidence =
    num(originalNutrition.calories) !== undefined && num(originalNutrition.fat) !== undefined
      ? "high"
      : "medium";
  return finish(c, "nutritionally_similar", confidence, reasons, cautions, suggestedQuantity, scaled);
}

function finish(
  c: RawCandidate,
  classification: ReplacementClassification,
  confidence: ReplacementConfidence,
  reasons: string[],
  cautions: string[],
  suggestedQuantity: number | undefined,
  nutrition: NutritionalProfile,
): FoodReplacementCandidate {
  const uniqueReasons = Array.from(new Set(reasons));
  const uniqueCautions = Array.from(new Set(cautions));
  return {
    foodName: c.foodName,
    suggestedQuantity,
    unit: c.unit,
    classification,
    confidence,
    reasons: uniqueReasons,
    cautions: uniqueCautions.length > 0 ? uniqueCautions : undefined,
    source: c.source,
    nutrition: Object.keys(nutrition).length > 0 ? nutrition : undefined,
    role: c.role,
    replacementGroupId: c.replacementGroupId,
  };
}

function compareRelative(
  original: number | undefined,
  scaled: number | undefined,
  tol: number,
  macro: "calories" | "protein",
  reasons: string[],
  cautions: string[],
  flag: (mild: boolean, gross: boolean) => void,
) {
  if (original === undefined || scaled === undefined || original <= 0) return;
  const diff = (scaled - original) / original;
  if (Math.abs(diff) <= tol) {
    reasons.push(macro === "calories" ? "similar_calories" : "similar_protein");
    return;
  }
  const higher = diff > 0;
  cautions.push(
    macro === "calories"
      ? higher
        ? "higher_calories"
        : "lower_calories"
      : higher
        ? "higher_protein"
        : "lower_protein",
  );
  flag(Math.abs(diff) <= 2 * tol, Math.abs(diff) > 2 * tol);
}

function compareAbsolute(
  original: number | undefined,
  scaled: number | undefined,
  tolGrams: number,
  reasons: string[],
  cautions: string[],
  flag: (mild: boolean, gross: boolean) => void,
) {
  if (original === undefined || scaled === undefined) return;
  const diff = scaled - original;
  if (Math.abs(diff) <= tolGrams) {
    reasons.push("similar_fat");
    return;
  }
  cautions.push(diff > 0 ? "higher_fat" : "lower_fat");
  flag(Math.abs(diff) <= 2 * tolGrams, Math.abs(diff) > 2 * tolGrams);
}
