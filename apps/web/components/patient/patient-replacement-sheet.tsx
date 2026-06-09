"use client";

import { useTranslations } from "next-intl";
import { useEffect, useReducer, useState } from "react";

import { ActionPill } from "../action-pill";
import { runReplacementSearch } from "@/lib/replacements/client";
import {
  presentReplacements,
  type PatientCandidate,
  type PatientReplacementView,
} from "@/lib/patient/present";
import type { FoodRole } from "@planpal/shared";

export type SelectedFood = {
  mealId: string;
  foodSlotId: string;
  optionId: string;
  foodName: string;
  quantity: number | "";
  unit: string;
  role?: FoodRole;
  mealLabel: string;
};

type Props = { food: SelectedFood; onClose: () => void };

type Phase = "loading" | "ready" | "noplan" | "error";

/**
 * Patient-facing replacement sheet (MVP-10a). Asks the engine for the tapped
 * food and shows the result in three calm, patient-safe buckets. Never implies a
 * non-approved candidate is allowed; no engine internals are rendered.
 */
export function PatientReplacementSheet({ food, onClose }: Props) {
  const t = useTranslations("patientPreview");
  const tr = useTranslations("foodRoles");
  const tu = useTranslations("foodUnits");
  const [phase, setPhase] = useReducer((_p: Phase, n: Phase) => n, "loading");
  const [view, setView] = useReducer(
    (_p: PatientReplacementView | null, n: PatientReplacementView | null) => n,
    null,
  );
  const [showNotMatch, setShowNotMatch] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await runReplacementSearch({
        mealId: food.mealId,
        foodSlotId: food.foodSlotId,
        optionId: food.optionId,
      });
      if (cancelled) return;
      if (r.kind === "result") {
        setView(presentReplacements(r.result));
        setPhase("ready");
      } else if (r.kind === "no_plan") {
        setPhase("noplan");
      } else {
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [food.mealId, food.foodSlotId, food.optionId]);

  const amount = (q?: number, u?: string) =>
    typeof q === "number" ? `${q} ${tu(u ?? food.unit)}` : "";
  const originalAmount =
    food.quantity === "" ? "" : `${food.quantity} ${tu(food.unit)}`;

  const sentence = food.role
    ? t("roleSentence", {
        food: food.foodName,
        amount: originalAmount,
        role: tr(food.role).toLowerCase(),
        meal: food.mealLabel.toLowerCase(),
      })
    : t("genericSentence", { food: food.foodName, amount: originalAmount });

  const canUse = view?.buckets.can_use ?? [];
  const ask = view?.buckets.ask_professional ?? [];
  const notMatch = view?.buckets.not_a_good_match ?? [];
  const nothing =
    phase === "ready" && canUse.length === 0 && ask.length === 0 && notMatch.length === 0;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-card border border-line bg-surface p-5 shadow-card sm:rounded-card">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">
            {t("sheetTitle", { food: food.foodName })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-pill px-2 text-xl leading-none text-faint hover:text-ink"
          >
            ×
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">{sentence}</p>

        {phase === "loading" ? (
          <p className="mt-5 text-sm text-muted" role="status">
            {t("loading")}
          </p>
        ) : phase === "error" || phase === "noplan" ? (
          <p className="mt-5 rounded-2xl border border-amber/30 bg-amber/10 p-4 text-sm font-medium text-amber">
            {t("insufficient")}
          </p>
        ) : view?.insufficientData || nothing ? (
          <p className="mt-5 rounded-2xl border border-line bg-surface-muted/60 p-4 text-sm text-muted">
            {view?.insufficientData ? t("insufficient") : t("noCandidates")}
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {canUse.length > 0 ? (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-mint">
                  {t("canUse")}
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {canUse.map((c, i) => (
                    <li
                      key={`cu-${c.foodName}-${i}`}
                      className="rounded-2xl border border-mint/30 bg-mint/10 p-3"
                    >
                      <p className="font-semibold text-ink">{c.foodName}</p>
                      <p className="text-sm text-ink">
                        {t("canUseAmount", { amount: amount(c.quantity, c.unit) })}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{t(`reasons.${c.reasonKey}`)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {ask.length > 0 ? (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-amber">
                  {t("askProfessional")}
                </h3>
                <p className="mt-1 text-xs text-muted">{t("askProfessionalNote")}</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {ask.map((c, i) => (
                    <li
                      key={`ap-${c.foodName}-${i}`}
                      className="rounded-2xl border border-line bg-surface-muted/60 p-3"
                    >
                      <p className="font-semibold text-ink">{c.foodName}</p>
                      <p className="text-sm text-muted">
                        {typeof c.quantity === "number"
                          ? t("askAmount", { amount: amount(c.quantity, c.unit) })
                          : t("noAmount")}
                      </p>
                      <p className="mt-0.5 text-xs text-faint">{t(`reasons.${c.reasonKey}`)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {notMatch.length > 0 ? (
              <section>
                <button
                  type="button"
                  onClick={() => setShowNotMatch((v) => !v)}
                  aria-expanded={showNotMatch}
                  className="text-xs font-semibold text-faint hover:text-muted"
                >
                  {showNotMatch
                    ? `▾ ${t("hideNotMatch")}`
                    : `▸ ${t("showNotMatch")}`}
                </button>
                {showNotMatch ? (
                  <ul className="mt-2 flex flex-col gap-2">
                    {notMatch.map((c: PatientCandidate, i) => (
                      <li
                        key={`nm-${c.foodName}-${i}`}
                        className="rounded-2xl border border-line bg-surface-muted/40 p-3 opacity-80"
                      >
                        <p className="font-medium text-muted">{c.foodName}</p>
                        <p className="mt-0.5 text-xs text-faint">{t(`reasons.${c.reasonKey}`)}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <ActionPill variant="ghost" onClick={onClose}>
            {t("close")}
          </ActionPill>
        </div>
      </div>
    </div>
  );
}
