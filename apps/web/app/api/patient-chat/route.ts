import { NextResponse } from "next/server";

import {
  getCurrentNutritionistId,
  isSameOrigin,
} from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured, isOpenAIConfigured } from "@/lib/env";
import { readSavedPlan } from "@/lib/professional/read-plan";
import { findReplacements } from "@/lib/replacements/engine";
import { readReplacementGroups } from "@/lib/replacements/read-groups";
import {
  composeAnswer,
  identifyTarget,
  type ClosedOption,
  type ComposeFood,
} from "@/lib/patient/chat-openai";
import {
  clarifyMessage,
  deterministicMessage,
  generalMessage,
  refusalMessage,
  validateGrounding,
} from "@/lib/patient/chat-safety";
import {
  DEFAULT_SAFETY_MODE,
  MAX_EXPLORATORY_IDEAS,
  SAFETY_MODES,
  type ChatTurn,
  type PatientChatBuckets,
  type PatientChatResponse,
  type PatientReplacementCard,
  type SafetyMode,
} from "@/lib/patient/chat-types";
import { presentReplacements } from "@/lib/patient/present";
import type { BuilderState } from "@/lib/professional/types";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 1000;

function locate(plan: BuilderState, optionId: string) {
  for (const meal of plan.meals) {
    for (const slot of meal.slots) {
      const option = slot.options.find((o) => o.id === optionId);
      if (option) return { meal, slot, option };
    }
  }
  return null;
}

const amt = (c: { quantity?: number | ""; unit?: string }) =>
  typeof c.quantity === "number" ? `${c.quantity} ${c.unit ?? ""}`.trim() : "";

/** Short-term context (request-scoped, not persisted): recent turns. */
function parseHistory(v: unknown): ChatTurn[] {
  if (!Array.isArray(v)) return [];
  const out: ChatTurn[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const text = typeof rec.text === "string" ? rec.text.trim() : "";
    if (!text) continue;
    out.push({ role: rec.role === "assistant" ? "assistant" : "user", text });
  }
  return out.slice(-6);
}
function parseLastTarget(v: unknown): { optionId: string; foodName: string } | undefined {
  if (!v || typeof v !== "object") return undefined;
  const rec = v as Record<string, unknown>;
  const optionId = typeof rec.optionId === "string" ? rec.optionId : "";
  if (!optionId) return undefined;
  return { optionId, foodName: typeof rec.foodName === "string" ? rec.foodName : "" };
}

/**
 * Conversational patient replacement assistant with safety modes (MVP-10a, ADR-018).
 * Professional-preview only: verify cookie → identify target (closed set) → run the
 * deterministic engine → server-build authoritative buckets → compose warm prose
 * (+ exploratory ideas in Explore) → validate grounding → respond. OpenAI never
 * decides what is allowed; only `approved` foods may be described as usable.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const uid = await getCurrentNutritionistId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isOpenAIConfigured()) {
    return NextResponse.json({ error: "assistant_not_configured" }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    const raw: unknown = await request.json();
    if (raw && typeof raw === "object") body = raw as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const message = (typeof body.message === "string" ? body.message : "").trim();
  if (!message) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "too_long" }, { status: 400 });
  }
  const mode: SafetyMode = SAFETY_MODES.includes(body.mode as SafetyMode)
    ? (body.mode as SafetyMode)
    : DEFAULT_SAFETY_MODE;
  const history = parseHistory(body.history);
  const lastTarget = parseLastTarget(body.lastTarget);

  const plan = await readSavedPlan(uid);
  if (!plan || !plan.planId) {
    return NextResponse.json({ kind: "no_plan" } satisfies PatientChatResponse);
  }
  const language = plan.plan.language;

  const closed: ClosedOption[] = [];
  for (const meal of plan.meals) {
    const mealLabel = meal.displayName.trim() || meal.name;
    for (const slot of meal.slots) {
      const slotLabel = slot.label.trim() || slot.category;
      for (const option of slot.options) {
        if (option.foodName.trim()) {
          closed.push({ optionId: option.id, foodName: option.foodName, mealLabel, slotLabel });
        }
      }
    }
  }

  let identify;
  try {
    identify = await identifyTarget(closed, message, language, history, lastTarget);
  } catch {
    return NextResponse.json({ error: "assistant_failed" }, { status: 502 });
  }

  if (identify.decision === "out_of_scope") {
    return NextResponse.json({ kind: "refuse", message: refusalMessage(language) });
  }
  if (identify.decision === "general") {
    return NextResponse.json({ kind: "general", message: generalMessage(language) });
  }
  if (identify.decision === "ambiguous") {
    return NextResponse.json({
      kind: "clarify",
      message: identify.clarifyingQuestion.trim() || clarifyMessage(language),
    });
  }

  const located = locate(plan, identify.optionId);
  if (!located) {
    return NextResponse.json({ kind: "clarify", message: clarifyMessage(language) });
  }
  const { meal, slot, option } = located;
  const mealLabel = meal.displayName.trim() || meal.name;

  // --- deterministic engine → server-built authoritative buckets ---
  const result = findReplacements(plan, await readReplacementGroups(uid), {
    planId: plan.planId,
    mealId: meal.id,
    foodSlotId: slot.id,
    optionId: option.id,
    originalFoodName: option.foodName,
  });
  const view = presentReplacements(result);
  const buckets: PatientChatBuckets = {
    approved: view.buckets.can_use,
    askProfessional: mode === "strict" ? [] : view.buckets.ask_professional,
    notAGoodMatch: mode === "strict" ? [] : view.buckets.not_a_good_match,
    exploratoryIdeas: [],
  };

  const toFoods = (cards: PatientReplacementCard[]): ComposeFood[] =>
    cards.map((c) => ({ foodName: c.foodName, amount: amt(c) }));

  // --- compose warm prose (+ exploratory ideas in Explore) ---
  let answerMessage: string;
  let followUp: string | undefined;
  try {
    const composed = await composeAnswer({
      language,
      mode,
      message,
      history,
      original: {
        foodName: option.foodName,
        amount: amt(option),
        roleLabel: option.role,
        mealLabel,
      },
      approved: toFoods(buckets.approved),
      askProfessional: toFoods(buckets.askProfessional),
      notAGoodMatch: toFoods(buckets.notAGoodMatch),
    });
    answerMessage = composed.message.trim();
    followUp = composed.followUpQuestion.trim() || undefined;

    if (mode === "explore") {
      const taken = new Set(
        [
          option.foodName,
          ...buckets.approved,
          ...buckets.askProfessional,
          ...buckets.notAGoodMatch,
        ]
          .map((x) => (typeof x === "string" ? x : x.foodName).trim().toLowerCase())
          .filter(Boolean),
      );
      for (const idea of composed.exploratoryIdeas) {
        const name = idea.foodName.trim();
        const key = name.toLowerCase();
        if (!name || taken.has(key)) continue;
        taken.add(key);
        buckets.exploratoryIdeas.push({
          foodName: name,
          approxNote: idea.approxNote.trim() || undefined,
          why: idea.why.trim() || undefined,
          exploratory: true,
        });
        if (buckets.exploratoryIdeas.length >= MAX_EXPLORATORY_IDEAS) break;
      }
    }
  } catch {
    answerMessage = "";
  }

  // --- grounding validation → deterministic fallback ---
  const nonApproved = [
    ...buckets.askProfessional,
    ...buckets.notAGoodMatch,
    ...buckets.exploratoryIdeas,
  ].map((c) => c.foodName);
  if (!answerMessage || !validateGrounding(answerMessage, nonApproved, language)) {
    answerMessage = deterministicMessage(language, mode, option.foodName, buckets);
    followUp = undefined;
    buckets.exploratoryIdeas = []; // never keep model ideas when prose failed validation
  }

  return NextResponse.json({
    kind: "answer",
    message: answerMessage,
    followUpQuestion: followUp,
    safetyMode: mode,
    original: {
      foodName: option.foodName,
      quantity: typeof option.quantity === "number" ? option.quantity : undefined,
      unit: option.unit,
    },
    target: { optionId: option.id, foodName: option.foodName },
    buckets,
  } satisfies PatientChatResponse);
}
