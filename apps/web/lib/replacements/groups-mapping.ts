/**
 * Pure validation + mapping for replacement groups (MVP-8a). No React, no
 * browser, no Firestore I/O — safe to import from server route handlers.
 *
 * The server whitelists every incoming group before writing: unknown fields are
 * dropped, the role enum is checked, macros are coerced to finite numbers, and
 * `nutritionistId`/timestamps are stamped server-side (never trusted from the
 * client). Owned path: nutritionists/{uid}/replacementGroups/{groupId}.
 */
import {
  DEFAULT_REPLACEMENT_TOLERANCE,
  FOOD_ROLES,
  type FoodRole,
  type FoodUnit,
  type NutritionalProfile,
  type ReplacementGroupMember,
  type ReplacementTolerance,
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

function parseTolerance(v: unknown): ReplacementTolerance {
  const t = isObject(v) ? v : {};
  return {
    caloriesPercent:
      finiteNum(t.caloriesPercent) ?? DEFAULT_REPLACEMENT_TOLERANCE.caloriesPercent,
    proteinPercent:
      finiteNum(t.proteinPercent) ?? DEFAULT_REPLACEMENT_TOLERANCE.proteinPercent,
    fatGrams: finiteNum(t.fatGrams) ?? DEFAULT_REPLACEMENT_TOLERANCE.fatGrams,
  };
}

/** Validated, whitelisted group content (without ownership/timestamps). */
export type ValidatedGroup = {
  id: string;
  name: string;
  role: FoodRole;
  tolerance: ReplacementTolerance;
  members: ReplacementGroupMember[];
};

type ValidationResult =
  | { ok: true; group: ValidatedGroup }
  | { ok: false; error: string };

export function validateReplacementGroup(input: unknown): ValidationResult {
  if (!isObject(input)) return { ok: false, error: "Body is not an object." };

  const id = str(input.id).trim();
  if (!id) return { ok: false, error: "Missing group id." };
  const name = str(input.name).trim();
  if (!name) return { ok: false, error: "Group name is required." };
  const role = str(input.role);
  if (!ROLES.has(role)) return { ok: false, error: `Invalid role: ${role}` };

  if (!Array.isArray(input.members)) {
    return { ok: false, error: "members must be an array." };
  }

  const members: ReplacementGroupMember[] = [];
  for (const raw of input.members) {
    if (!isObject(raw)) return { ok: false, error: "Invalid member." };
    const foodName = str(raw.foodName).trim();
    if (!foodName) continue; // drop blank members rather than error
    const unitRaw = str(raw.unit);
    const member: ReplacementGroupMember = { id: str(raw.id) || crypto.randomUUID(), foodName };
    const quantity = finiteNum(raw.quantity);
    if (quantity !== undefined) member.quantity = quantity;
    if (UNITS.has(unitRaw)) member.unit = unitRaw as FoodUnit;
    const nutrition = parseProfile(raw.nutrition);
    if (nutrition) member.nutrition = nutrition;
    members.push(member);
  }

  return {
    ok: true,
    group: { id, name, role: role as FoodRole, tolerance: parseTolerance(input.tolerance), members },
  };
}
