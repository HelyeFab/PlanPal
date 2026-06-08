/**
 * Locale types shared across PlanPal.
 *
 * PlanPal is bilingual from the first scaffold (ADR-008): English and Italian.
 * This matches the plan/assistant language values in docs/MVP_3_AI_ASSISTANT_SPEC.md.
 */

/** Locales the app UI and assistant support. */
export type SupportedLocale = "en" | "it";

/** All supported locales, in display order. The first entry is the default (it). */
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ["it", "en"];

/** Default app locale — Italian is a core target audience (ADR-008). */
export const DEFAULT_LOCALE: SupportedLocale = "it";
