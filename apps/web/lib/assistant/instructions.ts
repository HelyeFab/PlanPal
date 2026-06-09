import type { AssistantPlanContext, SupportedLocale } from "@planpal/shared";

/**
 * Server-side assistant instructions (never sent to the client). PlanPal is the
 * source of truth; OpenAI is only the language engine. See
 * docs/MVP_7_PLAN_GROUNDED_ASSISTANT.md and ADR-012.
 */
export const SYSTEM_INSTRUCTION = `You are PlanPal, an assistant that helps a nutrition professional explain and operate a nutrition plan that the professional created.

Strict rules:
- You answer ONLY from the provided plan context. Treat it as the single source of truth.
- You do NOT create new diets or plans from scratch.
- You do NOT prescribe medical treatment, diagnose symptoms, or give medical advice.
- You do NOT override the professional.
- You do NOT invent foods, quantities, or substitutions that are not in the plan.
- A substitution is allowed ONLY if BOTH foods are approved options in the SAME food slot. If a requested substitution is not an approved option in the same slot, say it is not listed as an approved substitution and should be checked with the professional.
- You MAY: explain the plan, summarise meals, list approved options, suggest meal ideas using only approved foods/options, produce shopping-list style summaries from the plan, and draft professional-safe explanations for the client.
- If the plan context does not support the answer, say so and suggest checking with the professional. Do not guess.

Set "safetyLevel":
- "ok" when the answer is fully grounded in the plan and you are NOT deferring anything to the professional.
- "needs_professional_review" when you decline a requested substitution, point out that something is not in the plan, are uncertain, or tell the professional to verify/decide anything.
- "refused" when the request is out of bounds (new diet, medical advice, diagnosis, overriding the plan, or anything outside the plan).

In "groundedIn", reference the meal ids and food-slot ids (the bracketed [ids] in the context) you used. Keep "answer" concise and practical. Respond in the requested language only.`;

const LANGUAGE_NAME: Record<SupportedLocale, string> = {
  en: "English",
  it: "Italian",
};

function serialiseContext(context: AssistantPlanContext): string {
  const lines: string[] = [];
  lines.push(`Plan: "${context.plan.title || "(untitled)"}" [planId: ${context.plan.id}]`);
  lines.push(`Plan language: ${context.plan.language}`);
  if (context.patient.displayName) {
    lines.push(`Client: ${context.patient.displayName}`);
  }
  lines.push("");
  lines.push("Meals:");
  if (context.meals.length === 0) {
    lines.push("  (no meals defined)");
  }
  for (const meal of context.meals) {
    const title = meal.displayName?.trim() || meal.name;
    const time = meal.timeLabel ? ` at ${meal.timeLabel}` : "";
    lines.push(`- ${title}${time} [mealId: ${meal.id}]${meal.notes ? ` — ${meal.notes}` : ""}`);
    for (const slot of meal.slots) {
      const label = slot.label?.trim() || slot.category;
      const req = slot.required ? "required" : "optional";
      lines.push(
        `  • Slot "${label}" (${slot.category}, ${req}) [foodSlotId: ${slot.id}]${slot.notes ? ` — ${slot.notes}` : ""}`,
      );
      lines.push("    Approved options:");
      if (slot.options.length === 0) {
        lines.push("      (none)");
      }
      for (const option of slot.options) {
        const qty = option.quantity ? ` ${option.quantity} ${option.unit}` : "";
        const def = option.isDefault ? " (default)" : "";
        lines.push(`      - ${option.foodName}${qty}${def}`);
      }
    }
  }
  return lines.join("\n");
}

/** Build the user input: serialised plan context + the question + language directive. */
export function buildUserInput(
  context: AssistantPlanContext,
  question: string,
  language: SupportedLocale,
): string {
  return [
    "PLAN CONTEXT (the only source of truth):",
    serialiseContext(context),
    "",
    `Professional's question: "${question}"`,
    "",
    `Answer ONLY from the plan context above. Respond in ${LANGUAGE_NAME[language]}.`,
  ].join("\n");
}
