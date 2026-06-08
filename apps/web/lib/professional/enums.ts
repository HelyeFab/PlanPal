/**
 * Enum value lists for builder dropdowns. Values are the shared domain unions;
 * their labels are resolved from i18n (`mealNames`, `foodCategories`, `foodUnits`).
 */
import type { FoodCategory, FoodUnit, MealName } from "@planpal/shared";

export const MEAL_NAMES: readonly MealName[] = [
  "breakfast",
  "morning_snack",
  "lunch",
  "afternoon_snack",
  "dinner",
  "custom",
];

export const FOOD_CATEGORIES: readonly FoodCategory[] = [
  "protein",
  "carbohydrate",
  "vegetable",
  "fruit",
  "fat",
  "dairy",
  "drink",
  "free",
  "supplement",
  "custom",
];

export const FOOD_UNITS: readonly FoodUnit[] = [
  "g",
  "ml",
  "piece",
  "tbsp",
  "tsp",
  "portion",
  "cup",
  "slice",
  "custom",
];
