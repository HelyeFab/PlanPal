import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";

import { AuthProvider } from "@/components/auth/auth-provider";
import { routing } from "@/i18n/routing";
import "../globals.css";

type LocaleParams = { params: Promise<{ locale: string }> };

/** Pre-render every supported locale at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });

  return {
    title: {
      default: `PlanPal — ${t("title")}`,
      template: "%s · PlanPal",
    },
    description: t("subtitle"),
    applicationName: "PlanPal",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: "PlanPal",
      statusBarStyle: "default",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#2f6bff",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode } & LocaleParams>) {
  const { locale } = await params;

  // Reject unknown locales and enable static rendering for known ones.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
