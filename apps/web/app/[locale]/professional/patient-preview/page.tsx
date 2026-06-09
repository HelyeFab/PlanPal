import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { ActionPill } from "@/components/action-pill";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/auth/require-auth";
import { PatientPlanView } from "@/components/patient/patient-plan-view";
import { getCurrentNutritionistId } from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { routing } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "patientPreview" });
  return { title: t("title") };
}

/**
 * MVP-10a prototype: a faithful, patient-styled preview of the professional's
 * own saved plan, behind the existing professional session. NOT a real patient
 * route — patient auth + server-side minimisation come in MVP-10b/10c.
 */
export default async function PatientPreviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  if (isFirebaseAdminConfigured()) {
    const uid = await getCurrentNutritionistId();
    if (!uid) {
      redirect(`/${locale}/sign-in?from=/professional/patient-preview`);
    }
  }

  const t = await getTranslations("patientPreview");

  return (
    <AppShell nav="minimal">
      <RequireAuth>
        <header className="mb-5">
          <ActionPill localeHref="/professional" variant="ghost" icon="←">
            {t("backToBuilder")}
          </ActionPill>
          <p className="mt-3 rounded-2xl bg-brand-soft px-3 py-2 text-xs font-medium text-brand">
            {t("previewBanner")}
          </p>
          <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{t("subtitle")}</p>
        </header>
        <PatientPlanView />
      </RequireAuth>
    </AppShell>
  );
}
