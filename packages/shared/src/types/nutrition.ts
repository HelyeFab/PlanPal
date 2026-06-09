/**
 * Nutrition vocabulary shared across PlanPal (MVP-8, ADR-013).
 *
 * `FoodRole` describes the *nutritional role* of a food for replacement logic.
 * It is intentionally SEPARATE from `FoodCategory` (which describes the plan
 * slot/category): a slot category is "protein", but a food's role might be the
 * more specific "lean_protein". Keep the concepts distinct; map where useful.
 */

/** Optional macro/energy profile for a food option or replacement member. */
export type NutritionalProfile = {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fibre?: number;
};

/** Nutritional role used by the replacement engine (richer than FoodCategory). */
export type FoodRole =
  | "lean_protein"
  | "protein"
  | "carbohydrate"
  | "fat"
  | "vegetable"
  | "fruit"
  | "dairy"
  | "mixed"
  | "other";

/** All roles, in display order. */
export const FOOD_ROLES: readonly FoodRole[] = [
  "lean_protein",
  "protein",
  "carbohydrate",
  "fat",
  "vegetable",
  "fruit",
  "dairy",
  "mixed",
  "other",
];
