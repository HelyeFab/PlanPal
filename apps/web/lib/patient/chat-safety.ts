/**
 * Patient-safe deterministic fallback + grounding validation (MVP-10a, ADR-018).
 * Used when OpenAI composition fails or the prose fails grounding checks: we fall
 * back to a Guided-style answer built only from the authoritative engine buckets
 * (no exploratory ideas). Bilingual strings live here so the server route needs no
 * client i18n.
 */
import type { PatientChatBuckets, SafetyMode } from "./chat-types";
import type { SupportedLocale } from "@planpal/shared";

const STR = {
  en: {
    intro: (food: string) => `Here are your options for ${food}.`,
    canUse: (food: string, amount: string) =>
      `You can use ${food}${amount ? ` ${amount}` : ""} — it's approved in your plan.`,
    approvedNone: "There are no other approved options for this yet — ask your professional.",
    askIntro: "Worth asking your professional about (not approved for this slot yet):",
    avoidIntro: "I'd avoid these for this swap:",
    refuse:
      "I can help you understand your current plan and its approved alternatives, but changes should be checked with your professional.",
    general:
      "I can help you find replacements for foods in your plan. Which food would you like to swap?",
    clarify: "I'm not sure which food you mean — which one would you like to replace?",
  },
  it: {
    intro: (food: string) => `Ecco le tue opzioni per ${food}.`,
    canUse: (food: string, amount: string) =>
      `Puoi usare ${food}${amount ? ` ${amount}` : ""} — è approvato nel tuo piano.`,
    approvedNone:
      "Non ci sono ancora altre opzioni approvate per questo — chiedi al tuo professionista.",
    askIntro: "Da chiedere al tuo professionista (non ancora approvati per questo spazio):",
    avoidIntro: "Eviterei questi per questo scambio:",
    refuse:
      "Posso aiutarti a capire il tuo piano attuale e le alternative approvate, ma le modifiche vanno verificate con il tuo professionista.",
    general:
      "Posso aiutarti a trovare sostituzioni per gli alimenti del tuo piano. Quale vuoi sostituire?",
    clarify: "Non sono sicuro di quale alimento intendi — quale vorresti sostituire?",
  },
} as const;

export function refusalMessage(language: SupportedLocale): string {
  return STR[language].refuse;
}
export function generalMessage(language: SupportedLocale): string {
  return STR[language].general;
}
export function clarifyMessage(language: SupportedLocale): string {
  return STR[language].clarify;
}

function amountOf(card: { quantity?: number; unit?: string }): string {
  return typeof card.quantity === "number" ? `${card.quantity} ${card.unit ?? ""}`.trim() : "";
}

/** Deterministic Guided-style answer from engine buckets (no exploratory ideas). */
export function deterministicMessage(
  language: SupportedLocale,
  mode: SafetyMode,
  originalFoodName: string,
  buckets: PatientChatBuckets,
): string {
  const s = STR[language];
  const parts: string[] = [s.intro(originalFoodName)];

  if (buckets.approved.length > 0) {
    for (const c of buckets.approved) parts.push(s.canUse(c.foodName, amountOf(c)));
  } else {
    parts.push(s.approvedNone);
  }

  if (mode !== "strict" && buckets.askProfessional.length > 0) {
    parts.push(`${s.askIntro} ${buckets.askProfessional.map((c) => c.foodName).join(", ")}.`);
  }
  if (mode !== "strict" && buckets.notAGoodMatch.length > 0) {
    parts.push(`${s.avoidIntro} ${buckets.notAGoodMatch.map((c) => c.foodName).join(", ")}.`);
  }
  return parts.join(" ");
}

const APPROVED_CLAIMS: Record<SupportedLocale, string[]> = {
  en: [
    "you can use",
    "you could use",
    "you can have",
    "is approved",
    "are approved",
    "approved in your plan",
    "safe to use",
  ],
  it: [
    "puoi usare",
    "puoi avere",
    "è approvato",
    "è approvata",
    "sono approvati",
    "approvato nel tuo piano",
    "approvata nel tuo piano",
  ],
};

/**
 * Grounding guard: an approved/usable claim ("you can use …") must not be applied
 * to a non-approved food. We check the short window immediately AFTER each claim
 * phrase for a non-approved food name — so "you can use Tofu, and as an idea Skyr"
 * is fine, but "you can use Skyr" (a non-approved idea) fails. Returns false →
 * route falls back to the deterministic message. The authoritative cards are the
 * real guarantee; this just keeps the prose honest.
 */
export function validateGrounding(
  message: string,
  nonApprovedNames: string[],
  language: SupportedLocale,
): boolean {
  const low = message.toLowerCase();
  const names = nonApprovedNames.map((n) => n.toLowerCase()).filter(Boolean);
  if (names.length === 0) return true;
  for (const claim of APPROVED_CLAIMS[language]) {
    let idx = low.indexOf(claim);
    while (idx !== -1) {
      const window = low.slice(idx + claim.length, idx + claim.length + 40);
      if (names.some((n) => window.includes(n))) return false;
      idx = low.indexOf(claim, idx + 1);
    }
  }
  return true;
}
