import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { ActionPill } from "@/components/action-pill";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/auth/require-auth";
import { ReplacementGroupManager } from "@/components/replacements/replacement-group-manager";
import { ReplacementTester } from "@/components/replacements/replacement-tester";
import { getCurrentNutritionistId } from "@/lib/auth/server-session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "replacements" });
  return { title: t("title") };
}

export default async function ReplacementsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  if (isFirebaseAdminConfigured()) {
    const uid = await getCurrentNutritionistId();
    if (!uid) {
      redirect(`/${locale}/sign-in?from=/professional/replacements`);
    }
  }

  const t = await getTranslations("replacements");
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : undefined;

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

        <ReplacementTester
          initialMealId={one(sp.mealId)}
          initialFoodSlotId={one(sp.foodSlotId)}
          initialOptionId={one(sp.optionId)}
        />

        <div className="mt-8">
          <h2 className="text-lg font-bold text-ink">{t("groupsHeading")}</h2>
          <p className="mb-4 mt-1 max-w-2xl text-sm text-muted">
            {t("groupsSubtitle")}
          </p>
          <ReplacementGroupManager />
        </div>
      </RequireAuth>
    </AppShell>
  );
}
