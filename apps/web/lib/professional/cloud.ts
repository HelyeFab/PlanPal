/**
 * Client wrappers for the cloud plan API (ADR-011). Thin fetch helpers used by
 * the builder; all real auth/ownership enforcement happens server-side.
 */
import type { BuilderState } from "./types";

/** Load the professional's saved plan, or null if none / not signed in. */
export async function loadPlanFromCloud(): Promise<BuilderState | null> {
  try {
    const res = await fetch("/api/plan", { method: "GET" });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (data && typeof data === "object" && "plan" in data) {
      const plan = (data as { plan: unknown }).plan;
      return (plan as BuilderState | null) ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Upsert the current plan. Returns ok + HTTP status for UI feedback. */
export async function savePlanToCloud(
  state: BuilderState,
): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch("/api/plan", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
