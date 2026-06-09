"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ActionPill } from "../action-pill";
import { SectionCard } from "../professional/section-card";
import { askAssistant, type AssistantResult } from "@/lib/assistant/client";
import type { AssistantSafetyLevel } from "@planpal/shared";

const badgeStyle: Record<AssistantSafetyLevel, string> = {
  ok: "bg-mint/15 text-mint",
  needs_professional_review: "bg-amber/15 text-amber",
  refused: "bg-muted/15 text-muted",
};
const badgeKey: Record<AssistantSafetyLevel, "ok" | "review" | "refused"> = {
  ok: "ok",
  needs_professional_review: "review",
  refused: "refused",
};

/**
 * Plan-helper panel (MVP-7) — a focused single-turn ask → answer, NOT a generic
 * chatbot. Answers are grounded in the saved plan; safety is surfaced as a badge.
 */
export function AssistantPanel() {
  const t = useTranslations("planAssistant");
  const chips = t.raw("chips") as string[];

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssistantResult | null>(null);

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setResult(null);
    const res = await askAssistant(trimmed);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <SectionCard title={t("ask")} subtitle={t("subtitle")}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit(question);
          }}
        >
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={t("placeholder")}
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-2xl border border-line bg-surface-muted px-3 py-2 text-sm text-ink placeholder:text-faint focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ActionPill type="submit" variant="solid" icon="✦">
              {loading ? t("asking") : t("ask")}
            </ActionPill>
            <span className="text-xs text-faint">{t("disclaimer")}</span>
          </div>
        </form>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
            {t("examples")}
          </p>
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <ActionPill
                key={chip}
                variant="soft"
                onClick={() => {
                  setQuestion(chip);
                  void submit(chip);
                }}
              >
                {chip}
              </ActionPill>
            ))}
          </div>
        </div>
      </SectionCard>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        {loading ? (
          <div
            className="flex min-h-40 items-center justify-center rounded-card border border-line bg-surface text-sm text-muted shadow-soft"
            role="status"
          >
            {t("asking")}
          </div>
        ) : result?.kind === "answer" ? (
          <article className="rounded-card border border-line bg-surface p-5 shadow-soft">
            <span
              className={`inline-block rounded-pill px-3 py-1 text-xs font-semibold ${badgeStyle[result.answer.safetyLevel]}`}
            >
              {t(`badge.${badgeKey[result.answer.safetyLevel]}`)}
            </span>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {result.answer.answer}
            </p>
            <p className="mt-3 text-xs text-faint">{t("grounded")}</p>
            {result.answer.suggestedFollowUpQuestions &&
            result.answer.suggestedFollowUpQuestions.length > 0 ? (
              <div className="mt-4 border-t border-line pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
                  {t("followUps")}
                </p>
                <div className="flex flex-col gap-2">
                  {result.answer.suggestedFollowUpQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setQuestion(q);
                        void submit(q);
                      }}
                      className="text-left text-sm font-medium text-brand hover:text-brand-strong"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        ) : result?.kind === "no_plan" ? (
          <p className="rounded-card border border-amber/30 bg-amber/10 p-5 text-sm font-medium text-amber">
            {t("noPlan")}
          </p>
        ) : result?.kind === "error" ? (
          <p className="rounded-card border border-amber/30 bg-amber/10 p-5 text-sm font-medium text-amber">
            {t("error")}
          </p>
        ) : (
          <p className="rounded-card border border-dashed border-line bg-surface-muted/50 p-5 text-sm text-muted">
            {t("empty")}
          </p>
        )}
      </aside>
    </div>
  );
}
