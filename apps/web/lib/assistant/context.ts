import type { AssistantPlanContext } from "@planpal/shared";

import type { BuilderState } from "@/lib/professional/types";

/**
 * Build the MINIMAL assistant context from a saved plan (ADR-012).
 *
 * Deliberately drops everything the model doesn't need: the professional's
 * private client note, plan status/notes, emails, ids of other clients/plans,
 * etc. Only plan-grounding data is included. Rules are empty for MVP-7 (no rules
 * UI yet). See docs/SECURITY_BOUNDARIES.md.
 */
export function buildAssistantContext(plan: BuilderState): AssistantPlanContext {
  const firstName = plan.client.name.trim().split(/\s+/)[0] ?? "";

  return {
    patient: {
      id: plan.patientId,
      displayName: firstName || undefined,
    },
    plan: {
      id: plan.planId,
      title: plan.plan.title,
      language: plan.plan.language,
    },
    meals: plan.meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      displayName: meal.displayName,
      timeLabel: meal.timeLabel || undefined,
      notes: meal.notes || undefined,
      slots: meal.slots.map((slot) => ({
        id: slot.id,
        label: slot.label,
        category: slot.category,
        required: slot.required,
        notes: slot.notes || undefined,
        options: slot.options.map((option) => ({
          id: option.id,
          foodName: option.foodName,
          quantity: typeof option.quantity === "number" ? option.quantity : 0,
          unit: option.unit,
          notes: option.notes || undefined,
          isDefault: option.isDefault,
        })),
      })),
    })),
    rules: [],
  };
}
