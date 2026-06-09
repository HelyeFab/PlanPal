/**
 * Pure validation/whitelisting for replacement approval (MVP-9, ADR-016). No
 * React, no I/O — safe for the server route. The route stamps the option id +
 * `approvedAt` and locates the owned slot; this only validates the payload.
 */
import {
  FOOD_ROLES,
  type ApprovedFromCandidate,
  type FoodRole,
  type FoodUnit,
  type NutritionalProfile,
} from "@planpal/shared";

const ROLES = new Set<string>(FOOD_ROLES);
const UNITS = new Set<string>([
  "g",
  "ml",
  "piece",
  "tbsp",
  "tsp",
  "portion",
  "cup",
  "slice",
  "custom",
]);
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
const MACRO_KEYS = ["calories", "protein", "carbohydrates", "fat", "fibre"] as const;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function finiteNum(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
function parseProfile(v: unknown): NutritionalProfile | undefined {
  if (!isObject(v)) return undefined;
  const p: NutritionalProfile = {};
  for (const key of MACRO_KEYS) {
    const n = finiteNum(v[key]);
    if (n !== undefined) p[key] = n;
  }
  return Object.keys(p).length > 0 ? p : undefined;
}

/** The whitelisted option fields to append (without server-stamped id/approvedAt). */
export type ApprovedOptionInput = {
  foodName: string;
  quantity: number | null;
  unit: FoodUnit;
  notes: string;
  role?: FoodRole;
  nutrition?: NutritionalProfile;
  replacementGroupId?: string;
};

export type ApprovalRequest = {
  mealId: string;
  foodSlotId: string;
  option: ApprovedOptionInput;
  provenance: Omit<ApprovedFromCandidate, "approvedAt">;
};

type Result =
  | { ok: true; value: ApprovalRequest }
  | { ok: false; error: string };

export function validateApproval(input: unknown): Result {
  if (!isObject(input)) return { ok: false, error: "Body is not an object." };
  const mealId = str(input.mealId).trim();
  const foodSlotId = str(input.foodSlotId).trim();
  if (!mealId || !foodSlotId) {
    return { ok: false, error: "Missing mealId or foodSlotId." };
  }

  const o = isObject(input.option) ? input.option : {};
  const foodName = str(o.foodName).trim();
  if (!foodName) return { ok: false, error: "Missing food name." };
  const unit = str(o.unit);
  if (!UNITS.has(unit)) return { ok: false, error: `Invalid unit: ${unit}` };
  const q = o.quantity;
  const quantity =
    q === "" || q === null || q === undefined ? null : finiteNum(q);
  if (quantity === undefined) {
    return { ok: false, error: "Quantity must be a number or blank." };
  }
  const role = ROLES.has(str(o.role)) ? (str(o.role) as FoodRole) : undefined;
  const nutrition = parseProfile(o.nutrition);
  const replacementGroupId = str(o.replacementGroupId).trim() || undefined;

  const p = isObject(input.provenance) ? input.provenance : {};
  const source = str(p.source);
  const classification = str(p.classification);
  const confidence = str(p.confidence);
  if (
    !SOURCES.has(source) ||
    !CLASSIFICATIONS.has(classification) ||
    !CONFIDENCES.has(confidence)
  ) {
    return { ok: false, error: "Invalid provenance." };
  }

  return {
    ok: true,
    value: {
      mealId,
      foodSlotId,
      option: {
        foodName,
        quantity,
        unit: unit as FoodUnit,
        notes: str(o.notes),
        ...(role ? { role } : {}),
        ...(nutrition ? { nutrition } : {}),
        ...(replacementGroupId ? { replacementGroupId } : {}),
      },
      provenance: {
        source: source as ApprovedFromCandidate["source"],
        classification: classification as ApprovedFromCandidate["classification"],
        confidence: confidence as ApprovedFromCandidate["confidence"],
      },
    },
  };
}
