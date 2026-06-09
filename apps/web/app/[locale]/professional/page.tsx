import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/auth/require-auth";
import { ProfessionalPlanBuilder } from "@/components/professional/professional-plan-builder";
import { getCurrentNutritionistId } from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { routing } from "@/i18n/routing";
import { createExamplePlan } from "@/lib/professional/example-plan";

type PageProps = { params: Promise<{ locale: string }> };

// Per-professional, cookie-gated page — never statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "builder" });
  return { title: t("title") };
}

export default async function ProfessionalPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // Real server gate: when Admin is configured, require a valid session cookie.
  // When it isn't (local dev without a service account), fall through so the
  // client RequireAuth can show the localised "not configured" notice instead.
  if (isFirebaseAdminConfigured()) {
    const uid = await getCurrentNutritionistId();
    if (!uid) {
      redirect(`/${locale}/sign-in?from=/professional`);
    }
  }

  const t = await getTranslations("builder");
  // First-visit seed: a populated example authored in the active locale so the
  // preview is meaningful immediately. A saved draft (localStorage) overrides it.
  const initialState = createExamplePlan(locale);

  return (
    <AppShell nav="minimal">
      <RequireAuth>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">
            {t("subtitle")}
          </p>
        </header>
        <ProfessionalPlanBuilder locale={locale} initialState={initialState} />
      </RequireAuth>
    </AppShell>
  );
}
