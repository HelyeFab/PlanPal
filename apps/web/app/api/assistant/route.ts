import { NextResponse } from "next/server";

import {
  getCurrentNutritionistId,
  isSameOrigin,
} from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured, isOpenAIConfigured } from "@/lib/env";
import { buildAssistantContext } from "@/lib/assistant/context";
import { askPlanAssistant } from "@/lib/assistant/openai";
import { readSavedPlan } from "@/lib/professional/read-plan";

export const runtime = "nodejs";

const MAX_QUESTION_LENGTH = 1000;

/**
 * Plan-grounded assistant (MVP-7, ADR-012). Professional-only:
 * verify session cookie → load the owned saved plan → minimal context →
 * server-side OpenAI call → structured answer. The OpenAI key never reaches the
 * client; the UID always comes from the verified cookie, never the body.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const uid = await getCurrentNutritionistId();
  if (!uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isOpenAIConfigured()) {
    return NextResponse.json({ error: "assistant_not_configured" }, { status: 503 });
  }

  let question = "";
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && "question" in body) {
      const value = (body as { question: unknown }).question;
      if (typeof value === "string") question = value.trim();
    }
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: "too_long" }, { status: 400 });
  }

  // No saved plan → never call OpenAI.
  const plan = await readSavedPlan(uid);
  if (!plan || !plan.planId) {
    return NextResponse.json({ noPlan: true });
  }

  try {
    // Locale precedence: plan.language (plans are authored in one language).
    const language = plan.plan.language;
    const context = buildAssistantContext(plan);
    const answer = await askPlanAssistant(context, question, language);
    // Server is the source of truth for what was actually loaded.
    answer.groundedIn.planId = plan.planId;
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "assistant_failed" }, { status: 502 });
  }
}
