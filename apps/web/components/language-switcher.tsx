"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import type { SupportedLocale } from "@planpal/shared";

/** Display order for the switcher (EN | IT). */
const LOCALE_ORDER: SupportedLocale[] = ["en", "it"];

/**
 * Minimal EN | IT pill switcher. Keeps the current page and swaps the locale
 * prefix via the locale-aware router. No persisted preference yet (MVP).
 */
export function LanguageSwitcher() {
  const t = useTranslations("language");
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex items-center rounded-pill border border-line bg-surface-muted p-0.5"
    >
      {LOCALE_ORDER.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => router.replace(pathname, { locale })}
            aria-pressed={isActive}
            className={`rounded-pill px-2.5 py-1 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-brand text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            {t(locale)}
          </button>
        );
      })}
    </div>
  );
}
