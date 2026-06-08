/**
 * Draft (working) types for the professional plan builder.
 *
 * These mirror the domain model in @planpal/shared (MealPlan → Meal → FoodSlot
 * → FoodOption) but are tuned for in-progress editing: server-managed fields
 * (id ownership, timestamps) are omitted, and a food option's quantity may be
 * empty ("") while the professional is still typing.
 *
 * They are NOT a parallel domain — field names and enums come straight from the
 * shared types, so this state maps cleanly onto Firestore later (ADR-009).
 */
import type {
  FoodCategory,
  FoodUnit,
  MealName,
  PlanStatus,
  SupportedLocale,
} from "@planpal/shared";

/** One approved option inside a slot. `quantity` is "" only while empty/editing. */
export type BuilderOption = {
  id: string;
  foodName: string;
  quantity: number | "";
  unit: FoodUnit;
  notes: string;
  isDefault: boolean;
};

export type BuilderSlot = {
  id: string;
  label: string;
  category: FoodCategory;
  required: boolean;
  notes: string;
  options: BuilderOption[];
};

export type BuilderMeal = {
  id: string;
  name: MealName;
  /** Optional override; the preview falls back to the localised meal name. */
  displayName: string;
  timeLabel: string;
  notes: string;
  slots: BuilderSlot[];
};

export type BuilderClient = {
  name: string;
  note: string;
};

/** Status options offered in the builder (archived is not authored here). */
export type BuilderPlanStatus = Extract<PlanStatus, "draft" | "active">;

export type BuilderPlan = {
  title: string;
  status: BuilderPlanStatus;
  notes: string;
  language: SupportedLocale;
};

/** The complete builder working state, persisted to localStorage. */
export type BuilderState = {
  client: BuilderClient;
  preferredLanguage: SupportedLocale;
  plan: BuilderPlan;
  meals: BuilderMeal[];
};
