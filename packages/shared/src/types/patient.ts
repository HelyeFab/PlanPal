/**
 * Patient domain types.
 *
 * Source of truth: docs/MVP_1_DATA_MODEL.md and docs/MVP_2_FIRESTORE_SCHEMA.md.
 */

/**
 * The person following the plan. Belongs to exactly one nutritionist in the MVP
 * and has at most one active plan at a time.
 */
export type Patient = {
  id: string;
  nutritionistId: string;
  name: string;
  email?: string;
  /** Private note for the professional about this client (not shown to the client). */
  note?: string;
  activePlanId?: string;
  createdAt: string;
  updatedAt: string;
};

/** High-level grouping of what a patient asked the assistant. */
export type QuestionCategory =
  | "substitution"
  | "recipe"
  | "shopping_list"
  | "eating_out"
  | "missed_meal"
  | "general";

/**
 * A stored interaction between a patient and the assistant.
 * Helps the professional understand repeated questions and improve plans.
 */
export type PatientQuestion = {
  id: string;
  nutritionistId: string;
  patientId: string;
  planId: string;
  question: string;
  answer: string;
  category?: QuestionCategory;
  createdAt: string;
};
