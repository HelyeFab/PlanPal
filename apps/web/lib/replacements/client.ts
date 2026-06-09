/**
 * Client wrapper for POST /api/replacements (MVP-8b). Thin fetch helper; all
 * deterministic classification + ownership enforcement happens server-side.
 */
import type { ReplacementResult } from "@planpal/shared";

export type ReplacementSearch = {
  mealId: string;
  foodSlotId: string;
  optionId?: string;
};

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
