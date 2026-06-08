"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ToggleField } from "./fields";
import type { BuilderState } from "@/lib/professional/types";

type Props = { state: BuilderState };

/**
 * The client-facing "today's plan" view, rendered live from builder state.
 *
 * Status display rule:
 * - draft (not previewing) → badge "Draft" + "client can't see this yet" warning
 * - draft + "preview as active" toggle on → badge "Preview", no warning
 * - active → badge "Active", no warning
 *
 * Read-only; empty/in-progress options are hidden (a client never sees them).
 */
export function ClientPlanPreview({ state }: Props) {
  const t = useTranslations("builder.preview");
  const tStatus = useTranslations("builder.plan.status");
  const tm = useTranslations("mealNames");
  const tc = useTranslations("foodCategories");
  const tu = useTranslations("foodUnits");

  const { plan, client, meals } = state;
  const isDraft = plan.status === "draft";
  const [previewAsActive, setPreviewAsActive] = useState(false);

  const showWarning = isDraft && !previewAsActive;
  const statusLabel = !isDraft
    ? tStatus("active")
    : previewAsActive
      ? t("statusPreview")
      : tStatus("draft");

  // Only meals that have at least one option with a real food name are shown.
  const visibleMeals = meals
    .map((meal) => ({
      ...meal,
      slots: meal.slots
        .map((slot) => ({
          ...slot,
          options: slot.options.filter((o) => o.foodName.trim().length > 0),
        }))
        .filter((slot) => slot.options.length > 0),
    }))
    .filter((meal) => meal.slots.length > 0);

  return (
    <div className="rounded-card border border-line bg-canvas p-4 shadow-soft">
      <div className="mb-3">
        <p className="text-sm font-bold text-ink">{t("heading")}</p>
        <p className="text-xs text-muted">{t("subtitle")}</p>
        {isDraft ? (
          <div className="mt-2">
            <ToggleField
              label={t("previewAsActive")}
              checked={previewAsActive}
              onChange={setPreviewAsActive}
            />
          </div>
        ) : null}
      </div>

      {/* Phone-style client card */}
      <div className="overflow-hidden rounded-[1.25rem] border border-line bg-surface">
        <div className="bg-gradient-to-br from-brand to-brand-strong p-4 text-white">
          <p className="text-xs font-medium text-white/80">
            {client.name.trim() || t("noClient")}
          </p>
          <h3 className="mt-0.5 text-lg font-bold leading-tight">
            {plan.title.trim() || t("untitledPlan")}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-pill bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold">
              {statusLabel}
            </span>
            <span className="rounded-pill bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase">
              {plan.language}
            </span>
          </div>
        </div>

        <div className="p-4">
          {showWarning ? (
            <p className="mb-3 rounded-2xl bg-amber/15 px-3 py-2 text-xs font-semibold text-amber">
              {t("draftNotice")}
            </p>
          ) : null}

          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">
            {t("todaysMeals")}
          </p>

          {visibleMeals.length === 0 ? (
            <p className="text-sm text-muted">{t("noMeals")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visibleMeals.map((meal) => (
                <li
                  key={meal.id}
                  className="rounded-2xl border border-line bg-surface-muted/50 p-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-semibold text-ink">
                      {meal.displayName.trim() || tm(meal.name)}
                    </h4>
                    {meal.timeLabel ? (
                      <time className="text-xs font-medium text-faint">
                        {meal.timeLabel}
                      </time>
                    ) : null}
                  </div>

                  <div className="mt-2 flex flex-col gap-2">
                    {meal.slots.map((slot) => (
                      <div key={slot.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink">
                            {slot.label.trim() || tc(slot.category)}
                          </span>
                          <span
                            className={`rounded-pill px-2 py-0.5 text-[10px] font-semibold ${
                              slot.required
                                ? "bg-brand-soft text-brand"
                                : "bg-muted/10 text-muted"
                            }`}
                          >
                            {slot.required ? t("required") : t("optional")}
                          </span>
                        </div>
                        <ul className="mt-1 flex flex-col gap-1">
                          {slot.options.map((option) => (
                            <li
                              key={option.id}
                              className="flex items-center gap-2 text-sm text-muted"
                            >
                              <span
                                className="size-1.5 rounded-full bg-brand/50"
                                aria-hidden="true"
                              />
                              <span className="text-ink">{option.foodName}</span>
                              {option.quantity !== "" ? (
                                <span className="text-faint">
                                  {option.quantity} {tu(option.unit)}
                                </span>
                              ) : null}
                              {option.isDefault ? (
                                <span className="rounded-pill bg-mint/15 px-1.5 py-0.5 text-[10px] font-semibold text-mint">
                                  {t("defaultBadge")}
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
