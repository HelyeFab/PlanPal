import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { SYSTEM_INSTRUCTION, buildUserInput } from "./instructions";
import { assistantAnswerSchema } from "./schema";
import { getServerEnv } from "@/lib/env";
import type {
  AssistantAnswer,
  AssistantPlanContext,
  SupportedLocale,
} from "@planpal/shared";

/** Keep responses short and cost bounded (MVP-7 — no streaming, no rate limiter). */
const MAX_OUTPUT_TOKENS = 700;

/**
 * Call the OpenAI Responses API server-side with Structured Outputs and return
 * a validated AssistantAnswer. The model/key come from server env; the key is
 * never exposed to the client. Throws on API/parse errors (model unavailable,
 * timeout, etc.) — the route maps that to a friendly localised message.
 */
export async function askPlanAssistant(
  context: AssistantPlanContext,
  question: string,
  language: SupportedLocale,
): Promise<AssistantAnswer> {
  const { openai } = getServerEnv();
  const client = new OpenAI({ apiKey: openai.apiKey });

  const response = await client.responses.parse({
    model: openai.model,
    instructions: SYSTEM_INSTRUCTION,
    input: buildUserInput(context, question, language),
    text: { format: zodTextFormat(assistantAnswerSchema, "assistant_answer") },
    max_output_tokens: MAX_OUTPUT_TOKENS,
  });

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error("Assistant returned no structured output.");
  }
  return parsed;
}
