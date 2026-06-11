"use client";

import { useTranslations } from "next-intl";

import type { ChatResult } from "@/lib/patient/chat-client";
import type { PatientReplacementCard } from "@/lib/patient/chat-types";

/** Renders one assistant turn: warm message + (for replacement answers) the
 * authoritative buckets. Exploratory ideas are always clearly not-approved. */
export function ChatAnswer({ result }: { result: ChatResult }) {
  const t = useTranslations("patientChat");
  const tu = useTranslations("foodUnits");

  const message =
    result.kind === "error"
      ? t("error")
      : result.kind === "no_plan"
        ? t("noPlan")
        : result.message;

  const amount = (c: PatientReplacementCard) =>
    typeof c.quantity === "number" ? `${c.quantity} ${tu(c.unit ?? "g")}` : "";

  return (
    <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3 shadow-soft">
      <p className="whitespace-pre-line text-sm text-ink">{message}</p>

      {result.kind === "answer" ? (
        <div className="mt-3 flex flex-col gap-3">
          {result.buckets.approved.length > 0 ? (
            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-mint">
                {t("canUse")}
              </h4>
              <ul className="mt-1 flex flex-col gap-1.5">
                {result.buckets.approved.map((c, i) => (
                  <li key={`a-${c.foodName}-${i}`} className="rounded-xl border border-mint/30 bg-mint/10 px-3 py-2">
                    <span className="font-semibold text-ink">{c.foodName}</span>
                    {amount(c) ? <span className="ml-2 text-sm text-ink">{amount(c)}</span> : null}
                    {c.reasonKey ? (
                      <span className="block text-xs text-muted">{t(`reasons.${c.reasonKey}`)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.buckets.askProfessional.length > 0 ? (
            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-amber">
                {t("askProfessional")}
              </h4>
              <p className="text-[11px] text-muted">{t("askProfessionalNote")}</p>
              <ul className="mt-1 flex flex-col gap-1.5">
                {result.buckets.askProfessional.map((c, i) => (
                  <li key={`p-${c.foodName}-${i}`} className="rounded-xl border border-line bg-surface-muted/60 px-3 py-2">
                    <span className="font-semibold text-ink">{c.foodName}</span>
                    {amount(c) ? <span className="ml-2 text-sm text-muted">{amount(c)}</span> : null}
                    {c.reasonKey ? (
                      <span className="block text-xs text-faint">{t(`reasons.${c.reasonKey}`)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.buckets.exploratoryIdeas.length > 0 ? (
            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-amber">
                {t("exploratory")}
              </h4>
              <ul className="mt-1 flex flex-col gap-1.5">
                {result.buckets.exploratoryIdeas.map((c, i) => (
                  <li
                    key={`e-${c.foodName}-${i}`}
                    className="rounded-xl border border-dashed border-amber/50 bg-amber/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{c.foodName}</span>
                      <span className="rounded-pill bg-amber/15 px-2 py-0.5 text-[10px] font-semibold text-amber">
                        {t("ideaBadge")}
                      </span>
                    </div>
                    {c.approxNote ? (
                      <span className="block text-xs text-muted">
                        {c.approxNote} · {t("approxLabel")}
                      </span>
                    ) : null}
                    {c.why ? <span className="block text-xs text-muted">{c.why}</span> : null}
                    <span className="mt-0.5 block text-[11px] font-medium text-amber">
                      {t("exploratoryWarning")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.buckets.notAGoodMatch.length > 0 ? (
            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                {t("notAGoodMatch")}
              </h4>
              <ul className="mt-1 flex flex-col gap-1">
                {result.buckets.notAGoodMatch.map((c, i) => (
                  <li key={`n-${c.foodName}-${i}`} className="text-xs text-faint">
                    {c.foodName}
                    {c.reasonKey ? ` — ${t(`reasons.${c.reasonKey}`)}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.followUpQuestion ? (
            <p className="mt-1 text-sm font-medium text-brand">{result.followUpQuestion}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
