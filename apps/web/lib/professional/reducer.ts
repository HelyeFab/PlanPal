/**
 * Pure reducer for the professional plan builder.
 *
 * All updates are immutable so React re-renders correctly. New ids are minted
 * with crypto.randomUUID() inside reducer actions — these only run from client
 * event handlers (after hydration), never during SSR, so there is no hydration
 * mismatch. Seed data uses deterministic ids (see example-plan.ts).
 */
import type {
  BuilderMeal,
  BuilderOption,
  BuilderPlan,
  BuilderSlot,
  BuilderState,
} from "./types";
import type { SupportedLocale } from "@planpal/shared";

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createOption(): BuilderOption {
  return {
    id: uid("opt"),
    foodName: "",
    quantity: "",
    unit: "g",
    notes: "",
    isDefault: false,
  };
}

export function createSlot(): BuilderSlot {
  return {
    id: uid("slot"),
    label: "",
    category: "protein",
    required: true,
    notes: "",
    options: [createOption()],
  };
}

export function createMeal(): BuilderMeal {
  return {
    id: uid("meal"),
    name: "breakfast",
    displayName: "",
    timeLabel: "",
    notes: "",
    slots: [],
  };
}

export type BuilderAction =
  | { type: "hydrate"; state: BuilderState }
  | { type: "reset"; state: BuilderState }
  | { type: "setNutritionistId"; uid: string }
  | { type: "setIds"; patientId: string; planId: string }
  | { type: "setClient"; patch: Partial<BuilderState["client"]> }
  | { type: "setPreferredLanguage"; language: SupportedLocale }
  | { type: "setPlan"; patch: Partial<BuilderPlan> }
  | { type: "addMeal" }
  | { type: "updateMeal"; mealId: string; patch: Partial<BuilderMeal> }
  | { type: "removeMeal"; mealId: string }
  | { type: "addSlot"; mealId: string }
  | {
      type: "updateSlot";
      mealId: string;
      slotId: string;
      patch: Partial<BuilderSlot>;
    }
  | { type: "removeSlot"; mealId: string; slotId: string }
  | { type: "addOption"; mealId: string; slotId: string }
  | {
      type: "updateOption";
      mealId: string;
      slotId: string;
      optionId: string;
      patch: Partial<BuilderOption>;
    }
  | { type: "removeOption"; mealId: string; slotId: string; optionId: string };

/** Map over a single meal by id, leaving the rest untouched. */
function mapMeal(
  meals: BuilderMeal[],
  mealId: string,
  fn: (meal: BuilderMeal) => BuilderMeal,
): BuilderMeal[] {
  return meals.map((meal) => (meal.id === mealId ? fn(meal) : meal));
}

function mapSlot(
  slots: BuilderSlot[],
  slotId: string,
  fn: (slot: BuilderSlot) => BuilderSlot,
): BuilderSlot[] {
  return slots.map((slot) => (slot.id === slotId ? fn(slot) : slot));
}

export function builderReducer(
  state: BuilderState,
  action: BuilderAction,
): BuilderState {
  switch (action.type) {
    case "hydrate":
    case "reset":
      return action.state;

    case "setNutritionistId":
      return { ...state, nutritionistId: action.uid };

    case "setIds":
      return {
        ...state,
        patientId: action.patientId,
        planId: action.planId,
      };

    case "setClient":
      return { ...state, client: { ...state.client, ...action.patch } };

    case "setPreferredLanguage":
      // The preferred client language also seeds the plan language.
      return {
        ...state,
        preferredLanguage: action.language,
        plan: { ...state.plan, language: action.language },
      };

    case "setPlan":
      return { ...state, plan: { ...state.plan, ...action.patch } };

    case "addMeal":
      return { ...state, meals: [...state.meals, createMeal()] };

    case "updateMeal":
      return {
        ...state,
        meals: mapMeal(state.meals, action.mealId, (meal) => ({
          ...meal,
          ...action.patch,
        })),
      };

    case "removeMeal":
      return {
        ...state,
        meals: state.meals.filter((meal) => meal.id !== action.mealId),
      };

    case "addSlot":
      return {
        ...state,
        meals: mapMeal(state.meals, action.mealId, (meal) => ({
          ...meal,
          slots: [...meal.slots, createSlot()],
        })),
      };

    case "updateSlot":
      return {
        ...state,
        meals: mapMeal(state.meals, action.mealId, (meal) => ({
          ...meal,
          slots: mapSlot(meal.slots, action.slotId, (slot) => ({
            ...slot,
            ...action.patch,
          })),
        })),
      };

    case "removeSlot":
      return {
        ...state,
        meals: mapMeal(state.meals, action.mealId, (meal) => ({
          ...meal,
          slots: meal.slots.filter((slot) => slot.id !== action.slotId),
        })),
      };

    case "addOption":
      return {
        ...state,
        meals: mapMeal(state.meals, action.mealId, (meal) => ({
          ...meal,
          slots: mapSlot(meal.slots, action.slotId, (slot) => ({
            ...slot,
            options: [...slot.options, createOption()],
          })),
        })),
      };

    case "updateOption":
      return {
        ...state,
        meals: mapMeal(state.meals, action.mealId, (meal) => ({
          ...meal,
          slots: mapSlot(meal.slots, action.slotId, (slot) => ({
            ...slot,
            options: slot.options.map((option) =>
              option.id === action.optionId
                ? { ...option, ...action.patch }
                : option,
            ),
          })),
        })),
      };

    case "removeOption":
      return {
        ...state,
        meals: mapMeal(state.meals, action.mealId, (meal) => ({
          ...meal,
          slots: mapSlot(meal.slots, action.slotId, (slot) => ({
            ...slot,
            options: slot.options.filter(
              (option) => option.id !== action.optionId,
            ),
          })),
        })),
      };

    default:
      return state;
  }
}
