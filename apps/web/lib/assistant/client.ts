/**
 * Client wrapper for POST /api/assistant. Returns a discriminated result so the
 * panel can render the answer, the "save a plan first" state, or a localised
 * error without leaking server details.
 */
import type { AssistantAnswer } from "@planpal/shared";

export type AssistantResult =
  | { kind: "answer"; answer: AssistantAnswer }
  | { kind: "no_plan" }
  | { kind: "error" };

export async function askAssistant(question: string): Promise<AssistantResult> {
  try {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) return { kind: "error" };
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      if ("noPlan" in data && (data as { noPlan: unknown }).noPlan === true) {
        return { kind: "no_plan" };
      }
      if ("answer" in data) {
        return {
          kind: "answer",
          answer: (data as { answer: AssistantAnswer }).answer,
        };
      }
    }
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}
