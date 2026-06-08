"use client";

import { useTranslations } from "next-intl";
import { useEffect, useReducer } from "react";

import { ClientDetailsCard } from "./client-details-card";
import { ClientPlanPreview } from "./client-plan-preview";
import { MealBuilder } from "./meal-builder";
import { PlanDetailsCard } from "./plan-details-card";
import { ActionPill } from "../action-pill";
import {
  createEmptyState,
  createExamplePlan,
} from "@/lib/professional/example-plan";
import { builderReducer } from "@/lib/professional/reducer";
import {
  clearBuilderState,
  loadBuilderState,
  saveBuilderState,
} from "@/lib/professional/storage";
import type { BuilderState } from "@/lib/professional/types";
import type { SupportedLocale } from "@planpal/shared";

type Props = {
  locale: SupportedLocale;
  initialState: BuilderState;
};

/** Layout-matching placeholder shown until the client-side draft is restored. */
function BuilderSkeleton() {
  return (
    <div
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-card border border-line bg-surface"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-card border border-line bg-surface" />
    </div>
  );
}

/**
 * Stateful root of the plan builder.
 *
 * The builder owns a localStorage-backed draft (ADR-009). Because that draft is
 * client-only state, the interactive UI is rendered on the client *after* the
 * draft is restored — this keeps the persisted edits surviving locale switches
 * (the page remounts per locale) and avoids hydration mismatches on the form
 * (including ones caused by form-filler browser extensions). The server renders
 * only a skeleton.
 */
export function ProfessionalPlanBuilder({ locale, initialState }: Props) {
  const t = useTranslations("builder");
  const tv = useTranslations("builder.validation");

  const [state, dispatch] = useReducer(builderReducer, initialState);
  // Mount flag via useReducer (dispatch in an effect is fine; setState is not).
  const [ready, markReady] = useReducer(() => true, false);

  // Restore a saved draft (if any) before showing the interactive builder.
  useEffect(() => {
    const saved = loadBuilderState();
    if (saved) dispatch({ type: "hydrate", state: saved });
    markReady();
  }, []);

  // Persist on every change, but only once the draft has been restored so we
  // never clobber a saved draft with the initial seed.
  useEffect(() => {
    if (!ready) return;
    saveBuilderState(state);
  }, [state, ready]);

  if (!ready) {
    return <BuilderSkeleton />;
  }

  const { client, plan, meals } = state;

  const issues: string[] = [];
  if (!client.name.trim()) issues.push(tv("clientName"));
  if (!plan.title.trim()) issues.push(tv("planTitle"));
  const hasUnnamedOption = meals.some((meal) =>
    meal.slots.some((slot) =>
      slot.options.some((option) => !option.foodName.trim()),
    ),
  );
  if (hasUnnamedOption) issues.push(tv("optionName"));

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <ActionPill
          variant="soft"
          onClick={() => dispatch({ type: "reset", state: createExamplePlan(locale) })}
        >
          {t("loadExample")}
        </ActionPill>
        <ActionPill
          variant="ghost"
          onClick={() => {
            clearBuilderState();
            dispatch({ type: "reset", state: createEmptyState(locale) });
          }}
        >
          {t("clear")}
        </ActionPill>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="flex flex-col gap-5">
          <ClientDetailsCard
            client={client}
            preferredLanguage={state.preferredLanguage}
            dispatch={dispatch}
          />
          <PlanDetailsCard plan={plan} dispatch={dispatch} />
          <MealBuilder meals={meals} dispatch={dispatch} />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {issues.length > 0 ? (
            <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
              <p className="text-sm font-bold text-ink">{tv("heading")}</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {issues.map((issue) => (
                  <li key={issue} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-0.5 text-amber" aria-hidden="true">
                      •
                    </span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="rounded-card border border-mint/30 bg-mint/10 p-4 text-sm font-medium text-mint">
              {tv("allGood")}
            </p>
          )}

          <ClientPlanPreview state={state} />
        </aside>
      </div>
    </div>
  );
}
