/**
 * Assistant types: the compact, minimised context sent to the AI provider,
 * plus the MVP request/response shape for the ask endpoint.
 *
 * Source of truth: docs/MVP_3_AI_ASSISTANT_SPEC.md and docs/SECURITY_BOUNDARIES.md.
 *
 * The assistant supports the active professional plan — it does not generate
 * plans (ADR-003). This context must be assembled server-side only.
 */

import type { PlanLanguage } from "./meal-plan";
import type { QuestionCategory } from "./patient";

/**
 * The minimal plan context handed to the assistant for a single question.
 * Only include what is needed to answer — never unrelated clients or secrets.
 */
export type AssistantPlanContext = {
  patient: {
    id: string;
    displayName?: string;
  };
  plan: {
    id: string;
    title: string;
    language: PlanLanguage;
  };
  meals: Array<{
    id: string;
    name: string;
    displayName: string;
    timeLabel?: string;
    notes?: string;
    slots: Array<{
      id: string;
      label: string;
      category: string;
      required: boolean;
      notes?: string;
      options: Array<{
        id: string;
        foodName: string;
        quantity: number;
        unit: string;
        notes?: string;
        isDefault?: boolean;
      }>;
    }>;
  }>;
  rules: Array<{
    title: string;
    content: string;
  }>;
};

/** Request body for POST /api/assistant/ask (server resolves active plan if omitted). */
export type AskAssistantRequest = {
  patientId: string;
  planId?: string;
  question: string;
};

/** Response body for POST /api/assistant/ask. */
export type AskAssistantResponse = {
  answer: string;
  category: QuestionCategory;
  questionId?: string;
};

/**
 * How safe/grounded an assistant answer is (MVP-7, ADR-012).
 * - `ok`: grounded in the saved plan.
 * - `needs_professional_review`: partial / uncertain — the professional should check.
 * - `refused`: out of bounds (e.g. new diet, medical advice, unsupported substitution).
 */
export type AssistantSafetyLevel = "ok" | "needs_professional_review" | "refused";

/**
 * Structured answer from the plan-grounded assistant. The model returns this
 * shape (Structured Outputs); the server validates it and forces `groundedIn.planId`
 * to the actually-loaded plan. PlanPal is the source of truth — see
 * docs/MVP_7_PLAN_GROUNDED_ASSISTANT.md.
 */
export type AssistantAnswer = {
  answer: string;
  safetyLevel: AssistantSafetyLevel;
  groundedIn: {
    planId: string;
    mealIds?: string[];
    foodSlotIds?: string[];
  };
  suggestedFollowUpQuestions?: string[];
};
