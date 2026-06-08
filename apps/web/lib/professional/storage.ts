/**
 * localStorage persistence for the builder draft.
 *
 * MVP-only: there is no auth/Firestore yet (ADR-009), so a professional's
 * in-progress plan survives refreshes via the browser. Reads are defensive —
 * malformed or partial JSON is ignored rather than crashing the builder.
 */
import type { BuilderState } from "./types";

const STORAGE_KEY = "planpal.builder.v1";

/** Minimal structural guard — enough to trust a stored draft's top-level shape. */
function isBuilderState(value: unknown): value is BuilderState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.client === "object" &&
    v.client !== null &&
    typeof v.plan === "object" &&
    v.plan !== null &&
    Array.isArray(v.meals) &&
    (v.preferredLanguage === "en" || v.preferredLanguage === "it")
  );
}

export function loadBuilderState(): BuilderState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isBuilderState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveBuilderState(state: BuilderState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode write failures — persistence is best-effort.
  }
}

export function clearBuilderState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
