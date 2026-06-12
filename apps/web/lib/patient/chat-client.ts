/**
 * Client wrapper for POST /api/patient-chat (MVP-10a). All identification,
 * engine grounding, and validation happen server-side.
 */
import type { ChatContext, PatientChatResponse, SafetyMode } from "./chat-types";

export type ChatResult = PatientChatResponse | { kind: "error" };

export async function sendPatientChat(
  message: string,
  mode: SafetyMode,
  context: ChatContext,
): Promise<ChatResult> {
  try {
    const res = await fetch("/api/patient-chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message,
        mode,
        history: context.history,
        lastTarget: context.lastTarget,
      }),
    });
    if (!res.ok) return { kind: "error" };
    const data: unknown = await res.json();
    if (data && typeof data === "object" && "kind" in data) {
      return data as PatientChatResponse;
    }
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}
