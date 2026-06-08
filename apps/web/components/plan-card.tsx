import { useTranslations } from "next-intl";

import type { PlanLanguage, PlanStatus } from "@planpal/shared";

const statusStyles: Record<PlanStatus, string> = {
  draft: "bg-amber/15 text-amber",
  active: "bg-mint/15 text-mint",
  archived: "bg-muted/15 text-muted",
};

type PlanCardProps = {
  /** Already-localised plan title and notes (resolved by the caller). */
  title: string;
  notes?: string;
  status: PlanStatus;
  language: PlanLanguage;
  mealCount: number;
};

/** PlanCard — summary of the patient's current plan with a status badge. */
export function PlanCard({
  title,
  notes,
  status,
  language,
  mealCount,
}: PlanCardProps) {
  const t = useTranslations("plan");

  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-faint">
            {t("label")}
          </p>
          <h3 className="mt-1 text-lg font-bold text-ink">{title}</h3>
        </div>
        <span
          className={`shrink-0 rounded-pill px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
        >
          {t(`status.${status}`)}
        </span>
      </div>

      {notes ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">{notes}</p>
      ) : null}

      <dl className="mt-4 flex gap-6 text-sm">
        <div>
          <dt className="text-faint">{t("meals")}</dt>
          <dd className="font-semibold text-ink">{mealCount}</dd>
        </div>
        <div>
          <dt className="text-faint">{t("language")}</dt>
          <dd className="font-semibold uppercase text-ink">{language}</dd>
        </div>
      </dl>

      <a
        href="#plan"
        className="mt-auto pt-4 text-sm font-semibold text-brand hover:text-brand-strong"
      >
        {t("viewFull")}
      </a>
    </article>
  );
}
