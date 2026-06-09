/**
 * Client helpers + editable shapes for replacement groups (MVP-8a). Macros and
 * tolerance are editable as `number | ""`; conversion to the stored numeric
 * shape happens here before the API call.
 */
import {
  DEFAULT_REPLACEMENT_TOLERANCE,
  type FoodRole,
  type FoodUnit,
  type NutritionalProfile,
  type ReplacementGroup,
} from "@planpal/shared";

export type EditableMacros = {
  calories: number | "";
  protein: number | "";
  carbohydrates: number | "";
  fat: number | "";
  fibre: number | "";
};
export const EMPTY_MACROS: EditableMacros = {
  calories: "",
  protein: "",
  carbohydrates: "",
  fat: "",
  fibre: "",
};
const MACRO_KEYS = ["calories", "protein", "carbohydrates", "fat", "fibre"] as const;

export type EditableMember = {
  id: string;
  foodName: string;
  quantity: number | "";
  unit: FoodUnit;
  nutrition: EditableMacros;
};

export type EditableTolerance = {
  caloriesPercent: number | "";
  proteinPercent: number | "";
  fatGrams: number | "";
};

export type EditableGroup = {
  id: string;
  name: string;
  role: FoodRole;
  tolerance: EditableTolerance;
  members: EditableMember[];
};

export function newEditableMember(): EditableMember {
  return {
    id: `member_${crypto.randomUUID()}`,
    foodName: "",
    quantity: "",
    unit: "g",
    nutrition: { ...EMPTY_MACROS },
  };
}

export function newEditableGroup(): EditableGroup {
  return {
    id: `group_${crypto.randomUUID()}`,
    name: "",
    role: "protein",
    tolerance: {
      caloriesPercent: DEFAULT_REPLACEMENT_TOLERANCE.caloriesPercent,
      proteinPercent: DEFAULT_REPLACEMENT_TOLERANCE.proteinPercent,
      fatGrams: DEFAULT_REPLACEMENT_TOLERANCE.fatGrams,
    },
    members: [],
  };
}

function profileToMacros(p?: NutritionalProfile): EditableMacros {
  const m: EditableMacros = { ...EMPTY_MACROS };
  if (p) for (const key of MACRO_KEYS) if (typeof p[key] === "number") m[key] = p[key]!;
  return m;
}

function macrosToProfile(m: EditableMacros): NutritionalProfile | undefined {
  const p: NutritionalProfile = {};
  for (const key of MACRO_KEYS) if (m[key] !== "") p[key] = m[key] as number;
  return Object.keys(p).length > 0 ? p : undefined;
}

function toEditable(group: ReplacementGroup): EditableGroup {
  return {
    id: group.id,
    name: group.name,
    role: group.role,
    tolerance: {
      caloriesPercent: group.tolerance?.caloriesPercent ?? "",
      proteinPercent: group.tolerance?.proteinPercent ?? "",
      fatGrams: group.tolerance?.fatGrams ?? "",
    },
    members: (group.members ?? []).map((member) => ({
      id: member.id,
      foodName: member.foodName,
      quantity: member.quantity ?? "",
      unit: member.unit ?? "g",
      nutrition: profileToMacros(member.nutrition),
    })),
  };
}

function toPayload(group: EditableGroup) {
  return {
    id: group.id,
    name: group.name,
    role: group.role,
    tolerance: {
      caloriesPercent:
        group.tolerance.caloriesPercent === "" ? undefined : group.tolerance.caloriesPercent,
      proteinPercent:
        group.tolerance.proteinPercent === "" ? undefined : group.tolerance.proteinPercent,
      fatGrams: group.tolerance.fatGrams === "" ? undefined : group.tolerance.fatGrams,
    },
    members: group.members.map((member) => ({
      id: member.id,
      foodName: member.foodName,
      quantity: member.quantity === "" ? undefined : member.quantity,
      unit: member.unit,
      nutrition: macrosToProfile(member.nutrition),
    })),
  };
}

export async function loadGroups(): Promise<EditableGroup[]> {
  try {
    const res = await fetch("/api/replacement-groups", { method: "GET" });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (data && typeof data === "object" && "groups" in data) {
      const groups = (data as { groups: ReplacementGroup[] }).groups;
      return Array.isArray(groups) ? groups.map(toEditable) : [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveGroup(group: EditableGroup): Promise<boolean> {
  try {
    const res = await fetch("/api/replacement-groups", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(group)),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteGroup(id: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/replacement-groups?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return res.ok;
  } catch {
    return false;
  }
}
