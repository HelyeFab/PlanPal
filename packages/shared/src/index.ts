/**
 * @planpal/shared — pure domain types shared across PlanPal apps.
 *
 * This package must stay free of runtime/app-specific code so it can be
 * consumed by both client and server code safely.
 */

export type {
  Nutritionist,
  NutritionistRule,
  RuleScope,
} from "./types/nutritionist";

export type {
  Patient,
  PatientQuestion,
  QuestionCategory,
} from "./types/patient";

export type {
  MealPlan,
  Meal,
  FoodSlot,
  FoodOption,
  PlanStatus,
  PlanLanguage,
  MealName,
  FoodCategory,
  FoodUnit,
} from "./types/meal-plan";

export type {
  AssistantPlanContext,
  AskAssistantRequest,
  AskAssistantResponse,
  AssistantAnswer,
  AssistantSafetyLevel,
} from "./types/assistant";

export type { SupportedLocale } from "./types/locale";
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./types/locale";

export type { NutritionalProfile, FoodRole } from "./types/nutrition";
export { FOOD_ROLES } from "./types/nutrition";

export type {
  ReplacementClassification,
  ReplacementConfidence,
  ReplacementTolerance,
  ReplacementGroupMember,
  ReplacementGroup,
  ReplacementSource,
  FoodReplacementRequest,
  FoodReplacementCandidate,
  ApprovedFromCandidate,
  ReplacementResult,
} from "./types/replacement";
export {
  DEFAULT_REPLACEMENT_TOLERANCE,
  categoryToDefaultRole,
} from "./types/replacement";
