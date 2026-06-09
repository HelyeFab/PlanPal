/**
 * Replacement domain types (MVP-8, ADR-013).
 *
 * The replacement engine (MVP-8b) is DETERMINISTIC: it classifies candidates
 * from stored macros + professional-defined replacement groups. OpenAI is never
 * in the classification path. These foundation types are defined in MVP-8a; the
 * engine consumes them in MVP-8b.
 */
import type { FoodCategory, FoodUnit } from "./meal-plan";
import type { FoodRole, NutritionalProfile } from "./nutrition";

/** How a candidate replacement relates to the plan (ADR-013). */
export type ReplacementClassification =
  | "approved" // already an approved option in the same FoodSlot (or approved via MVP-9)
  | "nutritionally_similar" // same role + macros within tolerance — still needs review
  | "needs_professional_review" // plausible but data missing/partial — defer
  | "not_suitable"; // different role, far outside tolerance, or unsupported

export type ReplacementConfidence = "low" | "medium" | "high";

/** Macro tolerance for "nutritionally similar". Initial MVP defaults — NOT clinical rules. */
export type ReplacementTolerance = {
  caloriesPercent: number;
  proteinPercent: number;
  fatGrams: number;
};

export const DEFAULT_REPLACEMENT_TOLERANCE: ReplacementTolerance = {
  caloriesPercent: 20,
  proteinPercent: 20,
  fatGrams: 5,
};

/** A food the professional considers interchangeable within a group. */
export type ReplacementGroupMember = {
  id: string;
  foodName: string;
  quantity?: number;
  unit?: FoodUnit;
  nutrition?: NutritionalProfile;
};

/**
 * A professional-defined set of interchangeable foods with a shared role and
 * tolerance. Owned by the professional:
 * nutritionists/{nutritionistId}/replacementGroups/{groupId}.
 */
export type ReplacementGroup = {
  id: string;
  nutritionistId: string;
  name: string;
  role: FoodRole;
  tolerance: ReplacementTolerance;
  members: ReplacementGroupMember[];
  createdAt: string;
  updatedAt: string;
};

/** Request to find replacements for a plan food (consumed by MVP-8b). */
export type FoodReplacementRequest = {
  planId: string;
  mealId: string;
  foodSlotId: string;
  optionId?: string;
  originalFoodName: string;
  originalQuantity?: number;
  originalUnit?: string;
};

/** Where a candidate came from. */
export type ReplacementSource =
  | "approved_option"
  | "replacement_group"
  | "same_role"
  | "nutrition_database"
  | "model_suggestion";

/** One classified candidate replacement (produced by MVP-8b). */
export type FoodReplacementCandidate = {
  foodName: string;
  suggestedQuantity?: number;
  unit?: string;
  classification: ReplacementClassification;
  confidence: ReplacementConfidence;
  reasons: string[]; // reason codes, localised in the UI
  cautions?: string[];
  source: ReplacementSource;
  // Resolved data so approval (MVP-9) can pre-fill a FoodOption. `nutrition` is
  // scaled to `suggestedQuantity` when scaling was possible.
  nutrition?: NutritionalProfile;
  role?: FoodRole;
  replacementGroupId?: string;
};

/**
 * Provenance recorded on a FoodOption that was approved from a replacement
 * candidate (MVP-9, ADR-016). Additive/optional; not editable in the normal
 * option editor; preserved by firestore-mapping and later builder saves.
 */
export type ApprovedFromCandidate = {
  source: ReplacementSource;
  classification: ReplacementClassification;
  confidence: ReplacementConfidence;
  approvedAt: string;
};

/** Engine result (MVP-8b). `insufficientData` when no macros/groups support an answer. */
export type ReplacementResult = {
  candidates: FoodReplacementCandidate[];
  insufficientData: boolean;
};

/** Default mapping from a slot's FoodCategory to a nutritional role. */
export function categoryToDefaultRole(category: FoodCategory): FoodRole {
  switch (category) {
    case "protein":
      return "protein";
    case "carbohydrate":
      return "carbohydrate";
    case "vegetable":
      return "vegetable";
    case "fruit":
      return "fruit";
    case "fat":
      return "fat";
    case "dairy":
      return "dairy";
    default:
      return "other";
  }
}
