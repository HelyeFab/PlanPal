import { z } from "zod";

/**
 * Structured-output schema for the assistant answer (ADR-012). Arrays are
 * required-but-possibly-empty (simplest/most reliable for OpenAI Structured
 * Outputs). The server forces `groundedIn.planId` to the loaded plan afterwards.
 */
export const assistantAnswerSchema = z.object({
  answer: z.string(),
  safetyLevel: z.enum(["ok", "needs_professional_review", "refused"]),
  groundedIn: z.object({
    planId: z.string(),
    mealIds: z.array(z.string()),
    foodSlotIds: z.array(z.string()),
  }),
  suggestedFollowUpQuestions: z.array(z.string()),
});

export type AssistantAnswerSchema = z.infer<typeof assistantAnswerSchema>;
