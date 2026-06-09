"use client";

import { useTranslations } from "next-intl";
import { useEffect, useReducer } from "react";

import { ActionPill } from "../action-pill";
import { SelectField } from "../professional/fields";
import { SectionCard } from "../professional/section-card";
import { loadPlanFromCloud } from "@/lib/professional/cloud";
import {
  runReplacementSearch,
  type ReplacementApiResult,
} from "@/lib/replacements/client";
import type {
  FoodReplacementCandidate,
  ReplacementClassification,
  ReplacementConfidence,
} from "@planpal/shared";

type FlatOption = {
  key: string;
  label: string;
  mealId: string;
  foodSlotId: string;
  optionId: string;
};

type Props = {
  initialMealId?: string;
  initialFoodSlotId?: string;
  initialOptionId?: string;
};

const classBadge: Record<ReplacementClassification, string> = {
  approved: "bg-mint/15 text-mint",
  nutritionally_similar: "bg-brand-soft text-brand",
  needs_professional_review: "bg-amber/15 text-amber",
  not_suitable: "bg-muted/15 text-muted",
};

/** Professional-only replacement tester (MVP-8b). Pick a saved-plan food, run
 * the deterministic engine, and view grouped candidates. No approval here (MVP-9). */
export function ReplacementTester({
  initialMealId,
  initialFoodSlotId,
  initialOptionId,
}: Props) {
  const t = useTranslations("replacements");
  const tcfg = useTranslations("replacements.confidence");
  const treason = useTranslations("replacements.reasons");
  const tcaution = useTranslations("replacements.cautions");

  const [options, setOptions] = useReducer(
    (_prev: FlatOption[], next: FlatOption[]) => next,
    [],
  );
  const [phase, setPhase] = useReducer(
    (_prev: "loading" | "ready" | "noplan", next: "loading" | "ready" | "noplan") => next,
    "loading",
  );
  const [selected, setSelected] = useReducer((_prev: string, next: string) => next, "");
  const [searching, setSearching] = useReducer((_prev: boolean, next: boolean) => next, false);
  const [result, setResult] = useReducer(
    (_prev: ReplacementApiResult | null, next: ReplacementApiResult | null) => next,
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const plan = await loadPlanFromCloud();
      if (cancelled) return;
      if (!plan) {
        setPhase("noplan");
        return;
      }
      const flat: FlatOption[] = [];
      for (const meal of plan.meals) {
        const mLabel = meal.displayName.trim() || meal.name;
        for (const slot of meal.slots) {
          const sLabel = slot.label.trim() || slot.category;
          for (const opt of slot.options) {
            if (!opt.foodName.trim()) continue;
            flat.push({
              key: `${meal.id}|${slot.id}|${opt.id}`,
              label: `${mLabel} › ${sLabel} › ${opt.foodName}`,
              mealId: meal.id,
              foodSlotId: slot.id,
              optionId: opt.id,
            });
          }
        }
      }
      setOptions(flat);
      const initKey =
        initialMealId && initialFoodSlotId && initialOptionId
          ? `${initialMealId}|${initialFoodSlotId}|${initialOptionId}`
          : "";
      setSelected(flat.some((f) => f.key === initKey) ? initKey : flat[0]?.key ?? "");
      setPhase("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [initialMealId, initialFoodSlotId, initialOptionId]);

  async function run() {
    const flat = options.find((o) => o.key === selected);
    if (!flat || searching) return;
    setSearching(true);
    setResult(null);
    const r = await runReplacementSearch({
      mealId: flat.mealId,
      foodSlotId: flat.foodSlotId,
      optionId: flat.optionId,
    });
    setResult(r);
    setSearching(false);
  }

  if (phase === "loading") {
    return <div className="h-40 animate-pulse rounded-card border border-line bg-surface" />;
  }
  if (phase === "noplan") {
    return (
      <p className="rounded-card border border-amber/30 bg-amber/10 p-5 text-sm font-medium text-amber">
        {t("noPlan")}
      </p>
    );
  }

  const candidates =
    result?.kind === "result" ? result.result.candidates : [];
  const insufficient = result?.kind === "result" && result.result.insufficientData;
  const groups: Array<{ titleKey: string; items: FoodReplacementCandidate[] }> = [
    { titleKey: "approved", items: candidates.filter((c) => c.classification === "approved") },
    {
      titleKey: "needsReview",
      items: candidates.filter(
        (c) =>
          c.classification === "nutritionally_similar" ||
          c.classification === "needs_professional_review",
      ),
    },
    { titleKey: "notSuitable", items: candidates.filter((c) => c.classification === "not_suitable") },
  ];

  const confidenceLabel = (c: ReplacementConfidence) => tcfg(c);

  return (
    <SectionCard title={t("findTitle")} subtitle={t("findSubtitle")}>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <SelectField
            label={t("selectOriginal")}
            value={selected}
            onChange={setSelected}
            options={options.map((o) => ({ value: o.key, label: o.label }))}
          />
        </div>
        <ActionPill variant="solid" icon="⇄" onClick={() => void run()}>
          {searching ? t("searching") : t("findReplacements")}
        </ActionPill>
      </div>

      <div className="mt-4">
        {result?.kind === "error" ? (
          <p className="rounded-2xl border border-amber/30 bg-amber/10 p-4 text-sm font-medium text-amber">
            {t("error")}
          </p>
        ) : result?.kind === "no_plan" ? (
          <p className="text-sm text-muted">{t("noPlan")}</p>
        ) : result?.kind === "result" && insufficient ? (
          <p className="rounded-2xl border border-amber/30 bg-amber/10 p-4 text-sm font-medium text-amber">
            {t("insufficientData")}
          </p>
        ) : result?.kind === "result" ? (
          <div className="flex flex-col gap-4">
            {groups.map((group) =>
              group.items.length === 0 ? null : (
                <div key={group.titleKey}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
                    {t(group.titleKey)}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {group.items.map((c, i) => (
                      <li
                        key={`${c.foodName}-${i}`}
                        className="rounded-2xl border border-line bg-surface-muted/50 p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-ink">{c.foodName}</span>
                          {c.suggestedQuantity !== undefined ? (
                            <span className="text-sm text-muted">
                              {c.suggestedQuantity} {c.unit ?? ""}
                            </span>
                          ) : null}
                          <span
                            className={`rounded-pill px-2 py-0.5 text-[10px] font-semibold ${classBadge[c.classification]}`}
                          >
                            {t(`class.${c.classification}`)}
                          </span>
                          <span className="rounded-pill bg-surface px-2 py-0.5 text-[10px] font-medium text-faint">
                            {confidenceLabel(c.confidence)}
                          </span>
                        </div>
                        {c.reasons.length > 0 ? (
                          <p className="mt-1 text-xs text-muted">
                            {c.reasons.map((code) => treason(code)).join(" · ")}
                          </p>
                        ) : null}
                        {c.cautions && c.cautions.length > 0 ? (
                          <p className="mt-1 text-xs font-medium text-amber">
                            {c.cautions.map((code) => tcaution(code)).join(" · ")}
                          </p>
                        ) : null}
                        {c.classification !== "approved" ? (
                          <p className="mt-1 text-xs text-faint">{t("candidateNote")}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
            {candidates.length === 0 ? (
              <p className="text-sm text-muted">{t("noCandidates")}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted">{t("runHint")}</p>
        )}
      </div>
    </SectionCard>
  );
}
