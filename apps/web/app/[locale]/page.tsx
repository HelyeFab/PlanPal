import { getTranslations, setRequestLocale } from "next-intl/server";

import { ActionPill } from "@/components/action-pill";
import { AppShell } from "@/components/app-shell";
import { HeroCard } from "@/components/hero-card";
import { MealCard } from "@/components/meal-card";
import { PlanCard } from "@/components/plan-card";
import {
  mockActivePlan,
  mockPatient,
  mockRecentQuestions,
  mockTodaysMeals,
} from "@/lib/mock-data";

type PageProps = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const shoppingItems = t.raw("shopping.items") as string[];
  const assistantChips = t.raw("assistant.chips") as string[];

  return (
    <AppShell>
      <HeroCard patientName={mockPatient.name} />

      {/* Patient dashboard preview */}
      <section aria-labelledby="today-heading" className="mt-8" id="today">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Today's meals */}
          <div className="rounded-card border border-line bg-surface p-5 shadow-soft lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 id="today-heading" className="text-lg font-bold text-ink">
                {t("today.heading")}
              </h2>
              <ActionPill href="#plan" variant="soft" className="px-3 py-1.5">
                {t("common.seeAll")}
              </ActionPill>
            </div>
            <ul className="mt-4 flex flex-col gap-3">
              {mockTodaysMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </ul>
          </div>

          {/* Active plan */}
          <div id="plan">
            <PlanCard
              title={t("plan.demoTitle")}
              notes={t("plan.demoNotes")}
              status={mockActivePlan.status}
              language={mockActivePlan.language}
              mealCount={mockTodaysMeals.length}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* Ask PlanPal */}
          <article
            id="assistant"
            className="flex flex-col rounded-card border border-line bg-surface p-5 shadow-soft"
          >
            <h3 className="text-lg font-bold text-ink">{t("assistant.heading")}</h3>
            <p className="mt-1 text-sm text-muted">{t("assistant.subtitle")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {assistantChips.map((chip) => (
                <ActionPill key={chip} variant="soft">
                  {chip}
                </ActionPill>
              ))}
            </div>
            <form
              className="mt-4 flex items-center gap-2 rounded-pill border border-line bg-surface-muted px-3 py-2"
              aria-label={t("assistant.heading")}
            >
              <label htmlFor="ask" className="sr-only">
                {t("assistant.heading")}
              </label>
              <input
                id="ask"
                name="ask"
                type="text"
                disabled
                placeholder={t("assistant.placeholder")}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
              />
              <ActionPill type="submit" variant="solid" className="px-3 py-1.5">
                {t("assistant.send")}
              </ActionPill>
            </form>
            <p className="mt-2 text-xs text-faint">{t("assistant.previewNote")}</p>
          </article>

          {/* Shopping list */}
          <article
            id="shopping"
            className="flex flex-col rounded-card border border-line bg-surface p-5 shadow-soft"
          >
            <h3 className="text-lg font-bold text-ink">{t("shopping.heading")}</h3>
            <p className="mt-1 text-sm text-muted">{t("shopping.subtitle")}</p>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {shoppingItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    className="size-4 rounded-md border border-line bg-surface-muted"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#shopping"
              className="mt-auto pt-4 text-sm font-semibold text-brand hover:text-brand-strong"
            >
              {t("shopping.generate")}
            </a>
          </article>
        </div>
      </section>

      {/* Professional preview */}
      <section aria-labelledby="pro-heading" className="mt-10">
        <div className="flex items-center gap-3">
          <h2 id="pro-heading" className="text-lg font-bold text-ink">
            {t("professional.heading")}
          </h2>
          <span className="rounded-pill bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            {t("professional.badge")}
          </span>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          {/* Client questions */}
          <article className="rounded-card border border-line bg-surface p-5 shadow-soft">
            <h3 className="font-bold text-ink">
              {t("professional.clientQuestions.title")}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {t("professional.clientQuestions.subtitle")}
            </p>
            <ul className="mt-4 space-y-3">
              {mockRecentQuestions.map((q) => (
                <li key={q.id} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 rounded-pill bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted">
                    {t(`categories.${q.category}`)}
                  </span>
                  <p className="text-sm text-ink">{t(`questions.${q.id}`)}</p>
                </li>
              ))}
            </ul>
          </article>

          {/* Active clients */}
          <article className="rounded-card border border-line bg-surface p-5 shadow-soft">
            <h3 className="font-bold text-ink">
              {t("professional.activeClients.title")}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {t("professional.activeClients.subtitle")}
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-bold text-ink">3</span>
              <span className="pb-1 text-sm text-muted">
                {t("professional.activeClients.detail")}
              </span>
            </div>
            <div className="mt-4 flex -space-x-2">
              {["E", "M", "L"].map((initial) => (
                <span
                  key={initial}
                  className="flex size-9 items-center justify-center rounded-full border-2 border-surface bg-brand-soft text-sm font-semibold text-brand"
                >
                  {initial}
                </span>
              ))}
            </div>
          </article>

          {/* Plan editor teaser */}
          <article className="flex flex-col rounded-card border border-dashed border-brand/40 bg-brand-soft/50 p-5">
            <h3 className="font-bold text-ink">
              {t("professional.planEditor.title")}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {t("professional.planEditor.subtitle")}
            </p>
            <ActionPill variant="solid" className="mt-4 self-start">
              {t("professional.planEditor.comingNext")}
            </ActionPill>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
