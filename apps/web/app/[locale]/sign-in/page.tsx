import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { routing } from "@/i18n/routing";
import { SignInForm } from "./sign-in-form";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("title") };
}

export default async function SignInPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const sp = await searchParams;
  const from = typeof sp.from === "string" ? sp.from : null;

  return (
    <AppShell nav="minimal">
      <div className="mx-auto flex max-w-md flex-col justify-center py-6 sm:py-10">
        <SignInForm from={from} />
      </div>
    </AppShell>
  );
}
