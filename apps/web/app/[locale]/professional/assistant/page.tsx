import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { ActionPill } from "@/components/action-pill";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/auth/require-auth";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { getCurrentNutritionistId } from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { routing } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "planAssistant" });
  return { title: t("title") };
}

export default async function AssistantPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // Real server gate (same as the builder).
  if (isFirebaseAdminConfigured()) {
    const uid = await getCurrentNutritionistId();
    if (!uid) {
      redirect(`/${locale}/sign-in?from=/professional/assistant`);
    }
  }

  const t = await getTranslations("planAssistant");

  return (
    <AppShell nav="minimal">
      <RequireAuth>
        <header className="mb-6">
          <ActionPill localeHref="/professional" variant="ghost" icon="←">
            {t("backToBuilder")}
          </ActionPill>
          <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">
            {t("subtitle")}
          </p>
        </header>
        <AssistantPanel />
      </RequireAuth>
    </AppShell>
  );
}
