/**
 * Client wrapper for POST /api/replacements (MVP-8b). Thin fetch helper; all
 * deterministic classification + ownership enforcement happens server-side.
 */
import type {
  FoodRole,
  FoodUnit,
  NutritionalProfile,
  ReplacementClassification,
  ReplacementConfidence,
  ReplacementResult,
  ReplacementSource,
} from "@planpal/shared";

export type ReplacementSearch = {
  mealId: string;
  foodSlotId: string;
  optionId?: string;
};

export type ApprovalPayload = {
  mealId: string;
  foodSlotId: string;
  option: {
    foodName: string;
    quantity: number | "";
    unit: FoodUnit;
    notes: string;
    role?: FoodRole;
    nutrition?: NutritionalProfile;
    replacementGroupId?: string;
  };
  provenance: {
    source: ReplacementSource;
    classification: ReplacementClassification;
    confidence: ReplacementConfidence;
  };
};

export type ApprovalResult = "ok" | "duplicate" | "error";

export async function approveReplacement(
  payload: ApprovalPayload,
): Promise<ApprovalResult> {
  try {
    const res = await fetch("/api/replacements/approve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return "error";
    const data: unknown = await res.json();
    if (data && typeof data === "object" && (data as { duplicate?: unknown }).duplicate === true) {
      return "duplicate";
    }
    return "ok";
  } catch {
    return "error";
  }
}

export type ReplacementApiResult =
  | { kind: "result"; result: ReplacementResult }
  | { kind: "no_plan" }
  | { kind: "error" };

export async function runReplacementSearch(
  search: ReplacementSearch,
): Promise<ReplacementApiResult> {
  try {
    const res = await fetch("/api/replacements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(search),
    });
    if (!res.ok) return { kind: "error" };
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      if ((data as { noPlan?: unknown }).noPlan === true) return { kind: "no_plan" };
      if ("result" in data) {
        return { kind: "result", result: (data as { result: ReplacementResult }).result };
      }
    }
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}
