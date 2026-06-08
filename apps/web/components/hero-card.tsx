import { useTranslations } from "next-intl";

import { ActionPill } from "./action-pill";

type HeroCardProps = {
  /** First name shown in the greeting, if known. */
  patientName?: string;
};

/**
 * HeroCard — the welcoming blue gradient panel at the top of the dashboard.
 * Carries the product promise and the primary actions. All copy is localised.
 */
export function HeroCard({ patientName }: HeroCardProps) {
  const t = useTranslations("hero");
  const greeting = patientName
    ? t("greeting", { name: patientName })
    : t("greetingGeneric");

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden rounded-card bg-gradient-to-br from-brand to-brand-strong p-6 text-white shadow-card sm:p-8"
    >
      {/* soft decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 right-16 size-44 rounded-full bg-white/10 blur-2xl"
      />

      <div className="relative max-w-xl">
        <p className="text-sm font-medium text-white/80">{greeting}</p>
        <h1
          id="hero-heading"
          className="mt-2 text-2xl font-bold leading-tight sm:text-3xl"
        >
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
          {t("subtitle")}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <ActionPill href="#assistant" variant="soft" icon="✦">
            {t("primaryCta")}
          </ActionPill>
          <ActionPill
            href="#today"
            variant="ghost"
            className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            {t("secondaryCta")}
          </ActionPill>
        </div>
      </div>
    </section>
  );
}
