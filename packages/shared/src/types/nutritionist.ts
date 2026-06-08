/**
 * Nutritionist domain types.
 *
 * Source of truth: docs/MVP_1_DATA_MODEL.md and docs/MVP_2_FIRESTORE_SCHEMA.md.
 * Keep these as pure types — no runtime or app-specific imports.
 */

/**
 * The professional who creates and owns patient plans.
 * In Firestore the `id` matches the authenticated Firebase user UID.
 */
export type Nutritionist = {
  id: string;
  name: string;
  email: string;
  clinicName?: string;
  createdAt: string;
  updatedAt: string;
};

/** Scope a professional rule applies to. */
export type RuleScope = "all_patients" | "specific_patient" | "specific_plan";

/**
 * A professional-level instruction that guides the assistant
 * (for example: "Never suggest alcohol as a substitution").
 */
export type NutritionistRule = {
  id: string;
  nutritionistId: string;
  title: string;
  content: string;
  appliesTo: RuleScope;
  patientId?: string;
  planId?: string;
  createdAt: string;
  updatedAt: string;
};
