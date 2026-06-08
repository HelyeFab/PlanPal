import { useTranslations } from "next-intl";

import type { MealPreview } from "@/lib/mock-data";

const accentDot: Record<MealPreview["accent"], string> = {
  brand: "bg-brand",
  mint: "bg-mint",
  amber: "bg-amber",
};

/** MealCard — one meal row in the "Today's meals" list. Copy from `meals.<key>`. */
export function MealCard({ meal }: { meal: MealPreview }) {
  const t = useTranslations("meals");

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-soft">
      <span
        className={`mt-0.5 size-2.5 shrink-0 rounded-full ${accentDot[meal.accent]}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="truncate font-semibold text-ink">
            {t(`${meal.key}.name`)}
          </h4>
          {meal.timeLabel ? (
            <time className="shrink-0 text-xs font-medium text-faint">
              {meal.timeLabel}
            </time>
          ) : null}
        </div>
        <p className="truncate text-sm text-muted">{t(`${meal.key}.summary`)}</p>
      </div>
    </li>
  );
}
