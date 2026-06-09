"use client";

import { useTranslations } from "next-intl";
import { useEffect, useReducer } from "react";

import { ClientDetailsCard } from "./client-details-card";
import { ClientPlanPreview } from "./client-plan-preview";
import { MealBuilder } from "./meal-builder";
import { PlanDetailsCard } from "./plan-details-card";
import { ActionPill } from "../action-pill";
import { useAuth } from "../auth/auth-provider";
import { loadPlanFromCloud, savePlanToCloud } from "@/lib/professional/cloud";
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

type SaveStatus = "idle" | "saving" | "saved" | "error";

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
  const tc = useTranslations("cloud");

  const { user } = useAuth();
  const [state, dispatch] = useReducer(builderReducer, initialState);
  // Mount flag + save status via useReducer (dispatch in an effect is fine;
  // setState in an effect is not, per the lint rule).
  const [ready, markReady] = useReducer(() => true, false);
  const [saveStatus, setSaveStatus] = useReducer(
    (_prev: SaveStatus, next: SaveStatus) => next,
    "idle",
  );
  // JSON of the last cloud-saved (or cloud-loaded) state, for the dirty check.
  // Kept in reducer state (not a ref) so it can be read during render.
  const [lastSaved, setLastSaved] = useReducer(
    (_prev: string | null, next: string | null) => next,
    null,
  );

  // Load the saved plan from the cloud (source of truth); fall back to the
  // localStorage draft, then the seed. Runs once after mount (user is present
  // because RequireAuth gates this component).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const cloud = user ? await loadPlanFromCloud() : null;
      if (cancelled) return;
      if (cloud) {
        dispatch({ type: "hydrate", state: cloud });
        setLastSaved(JSON.stringify(cloud));
        setSaveStatus("saved");
      } else {
        const local = loadBuilderState();
        if (local) dispatch({ type: "hydrate", state: local });
      }
      markReady();
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Keep the localStorage buffer in sync (offline safety) once restored.
  useEffect(() => {
    if (!ready) return;
    saveBuilderState(state);
  }, [state, ready]);

  // Stamp the signed-in professional's UID as the plan owner (nutritionistId).
  useEffect(() => {
    if (user && state.nutritionistId !== user.uid) {
      dispatch({ type: "setNutritionistId", uid: user.uid });
    }
  }, [user, state.nutritionistId]);

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

  const dirty =
    lastSaved !== null && JSON.stringify(state) !== lastSaved;
  const statusLabel =
    saveStatus === "saving"
      ? tc("saving")
      : saveStatus === "error"
        ? tc("error")
        : saveStatus === "saved"
          ? dirty
            ? tc("unsaved")
            : tc("saved")
          : null;

  async function handleSave() {
    if (!user || saveStatus === "saving") return;
    // Mint stable Firestore ids on first save (client-generated, namespaced
    // under the professional's UID server-side).
    let toSave = state;
    if (!toSave.patientId || !toSave.planId) {
      const patientId = toSave.patientId || `patient_${crypto.randomUUID()}`;
      const planId = toSave.planId || `plan_${crypto.randomUUID()}`;
      dispatch({ type: "setIds", patientId, planId });
      toSave = { ...toSave, patientId, planId };
    }
    setSaveStatus("saving");
    const res = await savePlanToCloud(toSave);
    if (res.ok) {
      setLastSaved(JSON.stringify(toSave));
      setSaveStatus("saved");
    } else {
      setSaveStatus("error");
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <ActionPill variant="solid" icon="☁" onClick={handleSave}>
          {saveStatus === "saving" ? tc("saving") : tc("save")}
        </ActionPill>
        {statusLabel ? (
          <span
            className={`text-xs font-medium ${
              saveStatus === "error"
                ? "text-amber"
                : dirty
                  ? "text-muted"
                  : "text-mint"
            }`}
            role="status"
          >
            {statusLabel}
          </span>
        ) : null}
        <span className="flex-1" />
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
