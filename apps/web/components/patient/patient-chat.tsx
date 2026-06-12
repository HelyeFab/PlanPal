"use client";

import { useTranslations } from "next-intl";
import { useEffect, useReducer, useState } from "react";

import { ChatAnswer } from "./chat-answer";
import { ActionPill } from "../action-pill";
import { loadPlanFromCloud } from "@/lib/professional/cloud";
import { sendPatientChat, type ChatResult } from "@/lib/patient/chat-client";
import {
  SAFETY_MODES,
  type ChatTurn,
  type SafetyMode,
} from "@/lib/patient/chat-types";
import type { BuilderState } from "@/lib/professional/types";

type Turn = { role: "user"; text: string } | { role: "assistant"; result: ChatResult };

const PROMPT_KEYS = ["whatInstead", "noThis", "sweet", "quick"] as const;

/** Extract the assistant text from a turn result (for short-term history). */
function assistantText(r: ChatResult): string {
  return r.kind === "answer" ||
    r.kind === "clarify" ||
    r.kind === "refuse" ||
    r.kind === "general"
    ? r.message
    : "";
}

/** Chat-first patient prototype with safety modes (MVP-10a). Professional-preview
 * only — the mode toggle is a professional control, not a patient one. */
export function PatientChat() {
  const t = useTranslations("patientChat");
  const tu = useTranslations("foodUnits");

  const [plan, setPlan] = useReducer(
    (_p: BuilderState | null, n: BuilderState | null) => n,
    null,
  );
  const [ready, markReady] = useReducer(() => true, false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<SafetyMode>("guided");
  const [sending, setSending] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [lastTarget, setLastTarget] = useState<
    { optionId: string; foodName: string } | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await loadPlanFromCloud();
      if (cancelled) return;
      setPlan(loaded);
      markReady();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function send(text: string) {
    const message = text.trim();
    if (!message || sending) return;
    const history: ChatTurn[] = turns
      .map((turn) =>
        turn.role === "user"
          ? { role: "user" as const, text: turn.text }
          : { role: "assistant" as const, text: assistantText(turn.result) },
      )
      .filter((t) => t.text);
    setTurns((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setSending(true);
    const result = await sendPatientChat(message, mode, { history, lastTarget });
    setTurns((prev) => [...prev, { role: "assistant", result }]);
    if (result.kind === "answer") setLastTarget(result.target);
    setSending(false);
  }

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-card border border-line bg-surface" />;
  }

  const meals = (plan?.meals ?? []).filter((m) =>
    m.slots.some((s) => s.options.some((o) => o.foodName.trim())),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* mode toggle (professional preview control) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-faint">{t("modeLabel")}:</span>
        <div className="inline-flex rounded-pill border border-line bg-surface p-0.5">
          {SAFETY_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-pill px-3 py-1 text-xs font-semibold transition ${
                mode === m ? "bg-brand text-white" : "text-muted hover:text-ink"
              }`}
            >
              {t(`modes.${m}`)}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-faint">{t("modeHint")}</span>
      </div>

      {/* collapsible plan context */}
      {meals.length > 0 ? (
        <div className="rounded-card border border-line bg-surface-muted/40 p-3">
          <button
            type="button"
            onClick={() => setShowPlan((v) => !v)}
            aria-expanded={showPlan}
            className="text-xs font-semibold text-brand"
          >
            {showPlan ? "▾ " : "▸ "}
            {t("planContext")}
          </button>
          {showPlan ? (
            <div className="mt-2 flex flex-col gap-2">
              {meals.map((meal) => (
                <div key={meal.id}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                    {meal.displayName.trim() || meal.name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {meal.slots
                      .flatMap((s) => s.options)
                      .filter((o) => o.foodName.trim())
                      .map((o) => {
                        const amt =
                          typeof o.quantity === "number" ? ` ${o.quantity} ${tu(o.unit)}` : "";
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() =>
                              void send(
                                t("whatInsteadTemplate", { food: `${o.foodName}${amt}` }),
                              )
                            }
                            className="rounded-pill border border-line bg-surface px-2.5 py-1 text-xs text-ink hover:border-brand/40 hover:bg-brand-soft/40"
                          >
                            {o.foodName}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* thread */}
      <div className="flex min-h-40 flex-col gap-3">
        {turns.length === 0 ? (
          <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3 text-sm text-muted shadow-soft">
            {t("greeting")}
          </div>
        ) : null}
        {turns.map((turn, i) =>
          turn.role === "user" ? (
            <div
              key={i}
              className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-sm text-white"
            >
              {turn.text}
            </div>
          ) : (
            <ChatAnswer key={i} result={turn.result} />
          ),
        )}
        {sending ? (
          <div className="self-start text-xs text-faint" role="status">
            {t("sending")}
          </div>
        ) : null}
      </div>

      {/* suggested prompts */}
      <div className="flex flex-wrap gap-1.5">
        {PROMPT_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => void send(t(`prompts.${k}`))}
            className="rounded-pill border border-line bg-surface px-3 py-1 text-xs text-muted hover:border-brand/40 hover:text-ink"
          >
            {t(`prompts.${k}`)}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-end gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          aria-label={t("inputPlaceholder")}
          className="min-w-0 flex-1 rounded-pill border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
        <ActionPill variant="solid" type="submit" icon="➤">
          {sending ? t("sending") : t("send")}
        </ActionPill>
      </form>
    </div>
  );
}
