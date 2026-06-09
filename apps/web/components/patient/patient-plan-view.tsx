"use client";

import { useTranslations } from "next-intl";
import { useEffect, useReducer, useState } from "react";

import {
  PatientReplacementSheet,
  type SelectedFood,
} from "./patient-replacement-sheet";
import { loadPlanFromCloud } from "@/lib/professional/cloud";
import type { BuilderState } from "@/lib/professional/types";

/**
 * Patient-facing plan view (MVP-10a). Renders the current saved plan the way a
 * client would see it — calm meal cards of approved foods. Tapping a food opens
 * the replacement sheet. Read-only; no professional concepts are shown.
 */
export function PatientPlanView() {
  const t = useTranslations("patientPreview");
  const tm = useTranslations("mealNames");
  const tu = useTranslations("foodUnits");

  const [plan, setPlan] = useReducer(
    (_p: BuilderState | null, n: BuilderState | null) => n,
    null,
  );
  const [ready, markReady] = useReducer(() => true, false);
  const [selected, setSelected] = useState<SelectedFood | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await loadPlanFromCloud();
      if (cancelled) return;
      setPlan(loaded);
      markReady();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-28 animate-pulse rounded-card border border-line bg-surface" />
        <div className="h-28 animate-pulse rounded-card border border-line bg-surface" />
      </div>
    );
  }

  const meals = (plan?.meals ?? []).filter((m) =>
    m.slots.some((s) => s.options.some((o) => o.foodName.trim())),
  );

  if (meals.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line bg-surface-muted/50 p-6 text-center text-sm text-muted">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {meals.map((meal) => {
        const mealLabel = meal.displayName.trim() || tm(meal.name);
        return (
          <section
            key={meal.id}
            className="rounded-card border border-line bg-surface p-4 shadow-soft"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-base font-bold text-ink">{mealLabel}</h2>
              {meal.timeLabel ? (
                <span className="text-xs font-medium text-faint">{meal.timeLabel}</span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {meal.slots.map((slot) => {
                const options = slot.options.filter((o) => o.foodName.trim());
                if (options.length === 0) return null;
                return (
                  <div key={slot.id}>
                    {slot.label.trim() ? (
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint">
                        {slot.label}
                      </p>
                    ) : null}
                    <ul className="flex flex-col gap-1.5">
                      {options.map((option) => (
                        <li key={option.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelected({
                                mealId: meal.id,
                                foodSlotId: slot.id,
                                optionId: option.id,
                                foodName: option.foodName,
                                quantity: option.quantity,
                                unit: option.unit,
                                role: option.role,
                                mealLabel,
                              })
                            }
                            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface-muted/50 px-3 py-2.5 text-left transition hover:border-brand/40 hover:bg-brand-soft/40"
                          >
                            <span className="min-w-0">
                              <span className="font-semibold text-ink">{option.foodName}</span>
                              {typeof option.quantity === "number" ? (
                                <span className="ml-2 text-sm text-muted">
                                  {option.quantity} {tu(option.unit)}
                                </span>
                              ) : null}
                            </span>
                            <span className="shrink-0 text-xs font-semibold text-brand">
                              {t("whatInstead")} ⇄
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {selected ? (
        <PatientReplacementSheet food={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
