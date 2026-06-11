/**
 * Types for the conversational patient replacement assistant with safety modes
 * (MVP-10a, ADR-018). The deterministic engine owns approved/ask/not; OpenAI may
 * only add `exploratory_ideas` in Explore mode, always clearly not-approved.
 */

export type SafetyMode = "strict" | "guided" | "explore";

export type PatientReplacementBucket =
  | "approved"
  | "ask_professional"
  | "exploratory_ideas"
  | "not_a_good_match";

/** One card shown to the patient. Engine cards carry `reasonKey`; exploratory
 * cards carry `approxNote`/`why` and `exploratory: true`. */
export type PatientReplacementCard = {
  foodName: string;
  quantity?: number;
  unit?: string;
  reasonKey?: string; // patient-safe reason key (engine-derived buckets)
  approxNote?: string; // e.g. "~170 cal, ~11g protein" (exploratory only)
  why?: string; // short rationale (exploratory only)
  exploratory?: boolean;
};

export type PatientChatBuckets = {
  approved: PatientReplacementCard[];
  askProfessional: PatientReplacementCard[];
  exploratoryIdeas: PatientReplacementCard[];
  notAGoodMatch: PatientReplacementCard[];
};

export type PatientChatResponse =
  | {
      kind: "answer";
      message: string;
      followUpQuestion?: string;
      safetyMode: SafetyMode;
      original: { foodName: string; quantity?: number; unit?: string };
      buckets: PatientChatBuckets;
    }
  | { kind: "clarify"; message: string }
  | { kind: "refuse"; message: string }
  | { kind: "general"; message: string }
  | { kind: "no_plan" };

export const SAFETY_MODES: readonly SafetyMode[] = ["strict", "guided", "explore"];
export const DEFAULT_SAFETY_MODE: SafetyMode = "guided";
export const MAX_EXPLORATORY_IDEAS = 5;
