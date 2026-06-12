import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getServerEnv } from "@/lib/env";
import type { ChatTurn, SafetyMode } from "./chat-types";
import type { SupportedLocale } from "@planpal/shared";

const LANGUAGE_NAME: Record<SupportedLocale, string> = { en: "English", it: "Italian" };

/** A compact transcript of recent turns (bounded), for model context. */
function transcript(history: ChatTurn[]): string {
  return history
    .slice(-6)
    .map((t) => `${t.role === "user" ? "Patient" : "PlanPal"}: ${t.text.slice(0, 300)}`)
    .join("\n");
}

// --- Call 1: closed-set target identification ------------------------------

const identifySchema = z.object({
  decision: z.enum(["found", "ambiguous", "out_of_scope", "general"]),
  optionId: z.string(),
  clarifyingQuestion: z.string(),
  refusalReason: z.enum(["new_diet", "medical", "ignore_plan", "unsafe", "unrelated", "none"]),
});
export type IdentifyResult = z.infer<typeof identifySchema>;

export type ClosedOption = {
  optionId: string;
  foodName: string;
  mealLabel: string;
  slotLabel: string;
};

const IDENTIFY_INSTRUCTION = `You identify which food in a patient's nutrition plan they want to replace, choosing ONLY from a CLOSED list.

Rules:
- Pick from the provided options by their exact optionId. NEVER invent an optionId.
- decision="found" + optionId when the message clearly refers to one option. Handle synonyms and languages (e.g. "Greek yogurt" = "Yogurt greco", "egg whites" = "Albumi").
- decision="ambiguous" + a short clarifyingQuestion when it could be several options.
- decision="out_of_scope" + refusalReason when they ask to create a new diet (new_diet), for medical advice/diagnosis (medical), to ignore their plan (ignore_plan), for unsafe restriction/weight-loss (unsafe), or for something unrelated to their plan (unrelated).
- decision="general" when it is a plan question but not a food replacement.
- FOLLOW-UPS: you also receive the recent conversation and (if any) the food last discussed. If the new message is a follow-up that refers to the SAME food without naming it (e.g. "a sweeter one", "something else", "yes", "what about savoury?"), return decision="found" with that same optionId. Only use "ambiguous" if you genuinely cannot tell which food.
Leave unused string fields empty (""), and refusalReason="none" unless out_of_scope. Write any text in the requested language.`;

export async function identifyTarget(
  options: ClosedOption[],
  message: string,
  language: SupportedLocale,
  history: ChatTurn[] = [],
  lastTarget?: { optionId: string; foodName: string },
): Promise<IdentifyResult> {
  const { openai } = getServerEnv();
  const client = new OpenAI({ apiKey: openai.apiKey });
  const list = options
    .map((o) => `- [optionId: ${o.optionId}] ${o.foodName} — meal "${o.mealLabel}", slot "${o.slotLabel}"`)
    .join("\n");
  const convo = history.length ? `\nRecent conversation:\n${transcript(history)}\n` : "";
  const last = lastTarget
    ? `\nFood last discussed: ${lastTarget.foodName} [optionId: ${lastTarget.optionId}]\n`
    : "";
  const input = `Reply language: ${LANGUAGE_NAME[language]}.

Plan foods (closed list — choose only from these):
${list || "(no foods in plan)"}
${convo}${last}
Patient message:
"""${message}"""`;

  const response = await client.responses.parse({
    model: openai.model,
    instructions: IDENTIFY_INSTRUCTION,
    input,
    text: { format: zodTextFormat(identifySchema, "target_identification") },
    max_output_tokens: 300,
  });
  const parsed = response.output_parsed;
  if (!parsed) throw new Error("Identification returned no structured output.");
  return parsed;
}

// --- Call 2: compose answer (+ exploratory ideas in Explore mode) ----------

const composeSchema = z.object({
  message: z.string(),
  followUpQuestion: z.string(),
  exploratoryIdeas: z.array(
    z.object({ foodName: z.string(), approxNote: z.string(), why: z.string() }),
  ),
});
export type ComposeResult = z.infer<typeof composeSchema>;

export type ComposeFood = { foodName: string; amount: string };
export type ComposeInput = {
  language: SupportedLocale;
  mode: SafetyMode;
  message: string;
  history?: ChatTurn[];
  original: { foodName: string; amount: string; roleLabel?: string; mealLabel: string };
  approved: ComposeFood[];
  askProfessional: ComposeFood[];
  notAGoodMatch: ComposeFood[];
};

const COMPOSE_INSTRUCTION = `You are PlanPal, a warm, encouraging assistant talking directly to a patient about ONE food in their plan. PlanPal is the source of truth; you never override the professional.

WORDING RULES (strict):
- "approved" foods: you MAY say "you can use this" / "approved in your plan".
- "ask_professional" foods: say they are "worth asking your professional about" and "not approved for this slot yet". NEVER say the patient can use them.
- "not_a_good_match" foods: say "I'd avoid this for this swap".
- NEVER describe a non-approved food as approved, allowed, safe, or usable.
- Do not invent quantities for approved/ask foods; use the amounts given.
- Do not give medical advice or create a new diet.

SAFETY MODE:
- strict: mention ONLY approved foods. If there are no approved alternatives, say so kindly and suggest asking the professional. exploratoryIdeas MUST be [].
- guided: mention approved + ask_professional (you may briefly note the avoid ones). exploratoryIdeas MUST be [].
- explore: mention approved + ask_professional, AND you MAY add up to 5 exploratoryIdeas — real foods close to the patient's target nutrition — as IDEAS TO DISCUSS, clearly NOT approved. For each give approxNote like "~170 cal, ~11g protein" (approximate) and a short why. NEVER present exploratory ideas as approved or usable.

PREFERENCES & FOLLOW-UPS: the recent conversation is provided. If the patient expressed a preference (sweeter, savoury, dairy-free, quick), honour it when choosing exploratory ideas (explore mode only). In strict/guided modes the approved options for a slot are fixed and cannot be filtered by taste — if none matches the preference, say so kindly and (if appropriate) suggest discussing other ideas with their professional. Never invent an approved food to satisfy a preference.

Write a short, warm "message" (2-5 sentences) and one "followUpQuestion" (e.g. sweet / savoury / quick / dairy-free). Respond ONLY in the requested language.`;

export async function composeAnswer(input: ComposeInput): Promise<ComposeResult> {
  const { openai } = getServerEnv();
  const client = new OpenAI({ apiKey: openai.apiKey });
  const foods = (label: string, list: ComposeFood[]) =>
    `${label}:\n${list.length ? list.map((f) => `  - ${f.foodName} ${f.amount}`.trimEnd()).join("\n") : "  (none)"}`;
  const convo = input.history?.length
    ? `\nRecent conversation:\n${transcript(input.history)}\n`
    : "";
  const userInput = `Reply language: ${LANGUAGE_NAME[input.language]}.
Safety mode: ${input.mode}.

Original food the patient wants to replace: ${input.original.foodName} ${input.original.amount}${
    input.original.roleLabel ? ` (role: ${input.original.roleLabel})` : ""
  }, in meal "${input.original.mealLabel}".
${convo}
Patient message:
"""${input.message}"""

AUTHORITATIVE buckets (do not change membership):
${foods("approved (usable)", input.approved)}
${foods("ask_professional (NOT approved yet)", input.askProfessional)}
${foods("not_a_good_match (avoid)", input.notAGoodMatch)}`;

  const response = await client.responses.parse({
    model: openai.model,
    instructions: COMPOSE_INSTRUCTION,
    input: userInput,
    text: { format: zodTextFormat(composeSchema, "patient_chat_answer") },
    max_output_tokens: 700,
  });
  const parsed = response.output_parsed;
  if (!parsed) throw new Error("Compose returned no structured output.");
  return parsed;
}
