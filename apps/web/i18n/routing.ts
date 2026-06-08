import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@planpal/shared";

/**
 * Locale routing config (next-intl).
 *
 * Locales and the default come from @planpal/shared so the app and shared code
 * agree on a single source of truth (ADR-008). Default is Italian; `/` redirects
 * to the default locale and every route is prefixed (`/it`, `/en`).
 */
export const routing = defineRouting({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});
