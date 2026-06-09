/**
 * Meal plan domain types: MealPlan -> Meal -> FoodSlot -> FoodOption.
 *
 * Source of truth: docs/MVP_1_DATA_MODEL.md and docs/MVP_2_FIRESTORE_SCHEMA.md.
 *
 * Per ADR-004, approved food options are embedded inside their FoodSlot for MVP.
 */

import type { SupportedLocale } from "./locale";
import type { FoodRole, NutritionalProfile } from "./nutrition";
import type { ApprovedFromCandidate } from "./replacement";

/** Lifecycle of a plan. Only one plan should be `active` per patient. */
export type PlanStatus = "draft" | "active" | "archived";

/** Language a plan is written in. Aligned with the app locales (en | it). */
export type PlanLanguage = SupportedLocale;

/** Canonical meal identity. `custom` covers anything outside the standard set. */
export type MealName =
  | "breakfast"
  | "morning_snack"
  | "lunch"
  | "afternoon_snack"
  | "dinner"
  | "custom";

/** Functional category of a food slot within a meal. */
export type FoodCategory =
  | "protein"
  | "carbohydrate"
  | "vegetable"
  | "fruit"
  | "fat"
  | "dairy"
  | "drink"
  | "free"
  | "supplement"
  | "custom";

/** Measurement unit for a food option quantity. */
export type FoodUnit =
  | "g"
  | "ml"
  | "piece"
  | "tbsp"
  | "tsp"
  | "portion"
  | "cup"
  | "slice"
  | "custom";

/**
 * One professional-approved option inside a FoodSlot.
 * Macros are intentionally omitted for MVP 0.1 (see data model doc).
 */
export type FoodOption = {
  id: string;
  foodName: string;
  quantity: number;
  unit: FoodUnit;
  notes?: string;
  isDefault?: boolean;
  /**
   * Optional replacement-engine metadata (MVP-8, ADR-013). Additive and
   * backward-compatible. Without macros/role an option falls back to
   * needs_professional_review in the engine; values are never invented.
   */
  nutrition?: NutritionalProfile;
  role?: FoodRole;
  replacementGroupId?: string;
  /** Provenance when this option was approved from a replacement candidate (MVP-9). */
  approvedFromCandidate?: ApprovedFromCandidate;
};

/**
 * A functional part of a meal. The most important object in the model:
 * "this meal needs something of this type, satisfied by one of these options".
 * A patient may only substitute within the same slot (MVP substitution rule).
 */
export type FoodSlot = {
  id: string;
  mealId: string;
  label: string;
  category: FoodCategory;
  required: boolean;
  sortOrder: number;
  notes?: string;
  options: FoodOption[];
  createdAt: string;
  updatedAt: string;
};

/** A meal within a plan. */
export type Meal = {
  id: string;
  planId: string;
  name: MealName;
  displayName: string;
  timeLabel?: string;
  sortOrder: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/** A professional nutrition plan assigned to a patient. */
export type MealPlan = {
  id: string;
  nutritionistId: string;
  patientId: string;
  title: string;
  status: PlanStatus;
  language: PlanLanguage;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
