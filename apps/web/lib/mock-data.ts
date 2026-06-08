/**
 * Mock data for the first UI shell only.
 *
 * Typed against @planpal/shared so the scaffold stays honest about the real
 * data model (docs/MVP_1_DATA_MODEL.md). No Firestore reads happen yet.
 *
 * User-facing display text is NOT stored here — components resolve it from the
 * i18n message files via a stable key (ADR-008). This file only holds structure
 * (ids, keys, ordering, status) and proper nouns.
 */
import type { MealPlan, Patient, QuestionCategory } from "@planpal/shared";

export const mockPatient: Patient = {
  id: "patient_001",
  nutritionistId: "nutri_001",
  name: "Emma",
  activePlanId: "plan_001",
  createdAt: "2026-06-01T09:00:00.000Z",
  updatedAt: "2026-06-01T09:00:00.000Z",
};

export const mockActivePlan: MealPlan = {
  id: "plan_001",
  nutritionistId: "nutri_001",
  patientId: "patient_001",
  // Title/notes are localised in the UI via the `plan` message namespace.
  title: "Spring Balance Plan",
  status: "active",
  language: "it",
  createdAt: "2026-06-01T09:10:00.000Z",
  updatedAt: "2026-06-05T18:00:00.000Z",
};

/** Message key under the `meals` namespace, decoupled from the canonical MealName. */
export type MealKey = "breakfast" | "lunch" | "snack" | "dinner";

/** Structure for one meal row; display text comes from `meals.<key>` messages. */
export type MealPreview = {
  id: string;
  key: MealKey;
  timeLabel: string;
  accent: "brand" | "mint" | "amber";
};

export const mockTodaysMeals: MealPreview[] = [
  { id: "meal_001", key: "breakfast", timeLabel: "07:30", accent: "brand" },
  { id: "meal_002", key: "lunch", timeLabel: "13:00", accent: "mint" },
  { id: "meal_003", key: "snack", timeLabel: "16:30", accent: "amber" },
  { id: "meal_004", key: "dinner", timeLabel: "20:00", accent: "brand" },
];

/** Message key under `questions`, plus the category that drives the badge. */
export type QuestionPreview = {
  id: "q1" | "q2" | "q3";
  category: QuestionCategory;
};

export const mockRecentQuestions: QuestionPreview[] = [
  { id: "q1", category: "substitution" },
  { id: "q2", category: "eating_out" },
  { id: "q3", category: "shopping_list" },
];
