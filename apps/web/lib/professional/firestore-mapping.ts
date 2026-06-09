/**
 * Pure mapping + validation between the builder draft (BuilderState) and the
 * Firestore document tree (docs/MVP_2_FIRESTORE_SCHEMA.md). No React, no
 * browser, no Firestore I/O — safe to import from server route handlers.
 *
 * The server validates/whitelists every incoming draft before writing (ADR-011):
 * unknown fields are dropped and invalid enum values are rejected, so we never
 * persist arbitrary client JSON.
 */
import { FOOD_CATEGORIES, FOOD_UNITS, MEAL_NAMES } from "./enums";
import { EMPTY_NUTRITION, type BuilderNutrition, type BuilderState } from "./types";
import { FOOD_ROLES } from "@planpal/shared";
import type {
  ApprovedFromCandidate,
  FoodCategory,
  FoodRole,
  FoodUnit,
  MealName,
  NutritionalProfile,
  PlanLanguage,
  PlanStatus,
} from "@planpal/shared";

const LOCALES = new Set<string>(["en", "it"]);
const STATUSES = new Set<string>(["draft", "active"]);
const MEALS = new Set<string>(MEAL_NAMES);
const CATEGORIES = new Set<string>(FOOD_CATEGORIES);
const UNITS = new Set<string>(FOOD_UNITS);
const ROLES = new Set<string>(FOOD_ROLES);
const SOURCES = new Set<string>([
  "approved_option",
  "replacement_group",
  "same_role",
  "nutrition_database",
  "model_suggestion",
]);
const CLASSIFICATIONS = new Set<string>([
  "approved",
  "nutritionally_similar",
  "needs_professional_review",
  "not_suitable",
]);
const CONFIDENCES = new Set<string>(["low", "medium", "high"]);

const MACRO_KEYS = [
  "calories",
  "protein",
  "carbohydrates",
  "fat",
  "fibre",
] as const;

/** Quantity stored in Firestore: a number, or null when left blank. */
type StoredOption = {
  id: string;
  foodName: string;
  quantity: number | null;
  unit: FoodUnit;
  notes: string;
  isDefault: boolean;
  // Optional replacement-engine metadata (MVP-8/9). Omitted when unset.
  role?: FoodRole;
  nutrition?: NutritionalProfile;
  replacementGroupId?: string;
  approvedFromCandidate?: ApprovedFromCandidate;
};

export type PlanTreeDocs = {
  patient: {
    id: string;
    nutritionistId: string;
    name: string;
    note: string;
    activePlanId: string;
  };
  plan: {
    id: string;
    nutritionistId: string;
    patientId: string;
    title: string;
    status: PlanStatus;
    language: PlanLanguage;
    notes: string;
  };
  meals: Array<{
    id: string;
    planId: string;
    name: MealName;
    displayName: string;
    timeLabel: string;
    sortOrder: number;
    notes: string;
    slots: Array<{
      id: string;
      mealId: string;
      label: string;
      category: FoodCategory;
      required: boolean;
      sortOrder: number;
      notes: string;
      options: StoredOption[];
    }>;
  }>;
};

// --- validation helpers -----------------------------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function numOrBlank(v: unknown): number | "" {
  return typeof v === "number" && Number.isFinite(v) ? v : "";
}
function validRole(v: unknown): FoodRole | undefined {
  return typeof v === "string" && ROLES.has(v) ? (v as FoodRole) : undefined;
}

/** Parse incoming macros into the builder's editable shape, or undefined if all blank. */
function parseNutrition(v: unknown): BuilderNutrition | undefined {
  if (!isObject(v)) return undefined;
  const n: BuilderNutrition = { ...EMPTY_NUTRITION };
  for (const key of MACRO_KEYS) n[key] = numOrBlank(v[key]);
  return MACRO_KEYS.some((k) => n[k] !== "") ? n : undefined;
}

/** BuilderNutrition → stored NutritionalProfile (omit blank fields), or undefined. */
function nutritionToProfile(n?: BuilderNutrition): NutritionalProfile | undefined {
  if (!n) return undefined;
  const p: NutritionalProfile = {};
  for (const key of MACRO_KEYS) {
    const value = n[key];
    if (value !== "") p[key] = value;
  }
  return Object.keys(p).length > 0 ? p : undefined;
}

/** Stored NutritionalProfile → BuilderNutrition (blank for missing), or undefined. */
function profileToBuilderNutrition(v: unknown): BuilderNutrition | undefined {
  if (!isObject(v)) return undefined;
  const n: BuilderNutrition = { ...EMPTY_NUTRITION };
  for (const key of MACRO_KEYS) n[key] = numOrBlank(v[key]);
  return MACRO_KEYS.some((k) => n[k] !== "") ? n : undefined;
}

/** Validate/whitelist approval provenance (MVP-9), or undefined. */
function validateProvenance(v: unknown): ApprovedFromCandidate | undefined {
  if (!isObject(v)) return undefined;
  const source = str(v.source);
  const classification = str(v.classification);
  const confidence = str(v.confidence);
  if (
    !SOURCES.has(source) ||
    !CLASSIFICATIONS.has(classification) ||
    !CONFIDENCES.has(confidence)
  ) {
    return undefined;
  }
  return {
    source: source as ApprovedFromCandidate["source"],
    classification: classification as ApprovedFromCandidate["classification"],
    confidence: confidence as ApprovedFromCandidate["confidence"],
    approvedAt: str(v.approvedAt),
  };
}

type ValidationResult =
  | { ok: true; state: BuilderState }
  | { ok: false; error: string };

/**
 * Validate + whitelist an incoming draft. Returns a clean BuilderState built
 * only from known fields, or an error. `nutritionistId` is intentionally NOT
 * trusted here — the route stamps the verified UID.
 */
export function validateBuilderState(input: unknown): ValidationResult {
  if (!isObject(input)) return { ok: false, error: "Body is not an object." };

  const patientId = str(input.patientId).trim();
  const planId = str(input.planId).trim();
  if (!patientId || !planId) {
    return { ok: false, error: "Missing patientId or planId." };
  }

  const client = isObject(input.client) ? input.client : {};
  const plan = isObject(input.plan) ? input.plan : {};

  const language = str(plan.language);
  if (!LOCALES.has(language)) {
    return { ok: false, error: "Invalid plan language." };
  }
  const status = str(plan.status);
  if (!STATUSES.has(status)) {
    return { ok: false, error: "Invalid plan status." };
  }
  const preferredLanguage = LOCALES.has(str(input.preferredLanguage))
    ? (str(input.preferredLanguage) as PlanLanguage)
    : (language as PlanLanguage);

  if (!Array.isArray(input.meals)) {
    return { ok: false, error: "meals must be an array." };
  }

  const meals: BuilderState["meals"] = [];
  for (const rawMeal of input.meals) {
    if (!isObject(rawMeal)) return { ok: false, error: "Invalid meal." };
    const mealName = str(rawMeal.name);
    if (!MEALS.has(mealName)) {
      return { ok: false, error: `Invalid meal name: ${mealName}` };
    }
    if (!Array.isArray(rawMeal.slots)) {
      return { ok: false, error: "meal.slots must be an array." };
    }

    const slots: BuilderState["meals"][number]["slots"] = [];
    for (const rawSlot of rawMeal.slots) {
      if (!isObject(rawSlot)) return { ok: false, error: "Invalid slot." };
      const category = str(rawSlot.category);
      if (!CATEGORIES.has(category)) {
        return { ok: false, error: `Invalid slot category: ${category}` };
      }
      if (!Array.isArray(rawSlot.options)) {
        return { ok: false, error: "slot.options must be an array." };
      }

      const options: BuilderState["meals"][number]["slots"][number]["options"] =
        [];
      for (const rawOption of rawSlot.options) {
        if (!isObject(rawOption)) return { ok: false, error: "Invalid option." };
        const unit = str(rawOption.unit);
        if (!UNITS.has(unit)) {
          return { ok: false, error: `Invalid unit: ${unit}` };
        }
        const q = rawOption.quantity;
        const quantity =
          q === "" || q === null || q === undefined
            ? ""
            : typeof q === "number" && Number.isFinite(q)
              ? q
              : null;
        if (quantity === null) {
          return { ok: false, error: "Quantity must be a number or blank." };
        }
        const role = validRole(rawOption.role);
        const nutrition = parseNutrition(rawOption.nutrition);
        const replacementGroupId =
          str(rawOption.replacementGroupId).trim() || undefined;
        const provenance = validateProvenance(rawOption.approvedFromCandidate);
        options.push({
          id: str(rawOption.id) || crypto.randomUUID(),
          foodName: str(rawOption.foodName),
          quantity,
          unit: unit as FoodUnit,
          notes: str(rawOption.notes),
          isDefault: rawOption.isDefault === true,
          ...(role ? { role } : {}),
          ...(nutrition ? { nutrition } : {}),
          ...(replacementGroupId ? { replacementGroupId } : {}),
          ...(provenance ? { approvedFromCandidate: provenance } : {}),
        });
      }

      slots.push({
        id: str(rawSlot.id) || crypto.randomUUID(),
        label: str(rawSlot.label),
        category: category as FoodCategory,
        required: rawSlot.required === true,
        notes: str(rawSlot.notes),
        options,
      });
    }

    meals.push({
      id: str(rawMeal.id) || crypto.randomUUID(),
      name: mealName as MealName,
      displayName: str(rawMeal.displayName),
      timeLabel: str(rawMeal.timeLabel),
      notes: str(rawMeal.notes),
      slots,
    });
  }

  return {
    ok: true,
    state: {
      nutritionistId: "", // route stamps the verified UID
      patientId,
      planId,
      preferredLanguage,
      client: { name: str(client.name), note: str(client.note) },
      plan: {
        title: str(plan.title),
        status: status as "draft" | "active",
        notes: str(plan.notes),
        language: language as PlanLanguage,
      },
      meals,
    },
  };
}

// --- mapping ----------------------------------------------------------------

/** BuilderState → Firestore document tree (ownership stamped from the UID). */
export function builderStateToDocs(
  state: BuilderState,
  uid: string,
): PlanTreeDocs {
  return {
    patient: {
      id: state.patientId,
      nutritionistId: uid,
      name: state.client.name,
      note: state.client.note,
      activePlanId: state.planId,
    },
    plan: {
      id: state.planId,
      nutritionistId: uid,
      patientId: state.patientId,
      title: state.plan.title,
      status: state.plan.status,
      language: state.plan.language,
      notes: state.plan.notes,
    },
    meals: state.meals.map((meal, mealIndex) => ({
      id: meal.id,
      planId: state.planId,
      name: meal.name,
      displayName: meal.displayName,
      timeLabel: meal.timeLabel,
      sortOrder: mealIndex,
      notes: meal.notes,
      slots: meal.slots.map((slot, slotIndex) => ({
        id: slot.id,
        mealId: meal.id,
        label: slot.label,
        category: slot.category,
        required: slot.required,
        sortOrder: slotIndex,
        notes: slot.notes,
        options: slot.options.map((option) => {
          const stored: StoredOption = {
            id: option.id,
            foodName: option.foodName,
            quantity: option.quantity === "" ? null : option.quantity,
            unit: option.unit,
            notes: option.notes,
            isDefault: option.isDefault,
          };
          if (option.role) stored.role = option.role;
          const nutrition = nutritionToProfile(option.nutrition);
          if (nutrition) stored.nutrition = nutrition;
          if (option.replacementGroupId) {
            stored.replacementGroupId = option.replacementGroupId;
          }
          if (option.approvedFromCandidate) {
            stored.approvedFromCandidate = option.approvedFromCandidate;
          }
          return stored;
        }),
      })),
    })),
  };
}

/** Firestore document tree → BuilderState (for load). */
export function docsToBuilderState(
  uid: string,
  patient: Record<string, unknown>,
  plan: Record<string, unknown>,
  meals: Array<{ data: Record<string, unknown>; slots: Record<string, unknown>[] }>,
): BuilderState {
  const language = LOCALES.has(str(plan.language))
    ? (str(plan.language) as PlanLanguage)
    : "it";
  const status = STATUSES.has(str(plan.status))
    ? (str(plan.status) as "draft" | "active")
    : "draft";

  return {
    nutritionistId: uid,
    patientId: str(patient.id),
    planId: str(plan.id),
    preferredLanguage: language,
    client: { name: str(patient.name), note: str(patient.note) },
    plan: {
      title: str(plan.title),
      status,
      notes: str(plan.notes),
      language,
    },
    meals: meals.map((m) => ({
      id: str(m.data.id),
      name: (MEALS.has(str(m.data.name)) ? str(m.data.name) : "custom") as MealName,
      displayName: str(m.data.displayName),
      timeLabel: str(m.data.timeLabel),
      notes: str(m.data.notes),
      slots: m.slots.map((s) => ({
        id: str(s.id),
        label: str(s.label),
        category: (CATEGORIES.has(str(s.category))
          ? str(s.category)
          : "custom") as FoodCategory,
        required: s.required === true,
        notes: str(s.notes),
        options: Array.isArray(s.options)
          ? (s.options as Record<string, unknown>[]).map((o) => {
              const role = validRole(o.role);
              const nutrition = profileToBuilderNutrition(o.nutrition);
              const replacementGroupId = str(o.replacementGroupId) || undefined;
              const provenance = validateProvenance(o.approvedFromCandidate);
              return {
                id: str(o.id),
                foodName: str(o.foodName),
                quantity: numOrBlank(o.quantity),
                unit: (UNITS.has(str(o.unit)) ? str(o.unit) : "g") as FoodUnit,
                notes: str(o.notes),
                isDefault: o.isDefault === true,
                ...(role ? { role } : {}),
                ...(nutrition ? { nutrition } : {}),
                ...(replacementGroupId ? { replacementGroupId } : {}),
                ...(provenance ? { approvedFromCandidate: provenance } : {}),
              };
            })
          : [],
      })),
    })),
  };
}
