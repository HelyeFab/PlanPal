# PlanPal MVP 7 — Plan-Grounded Assistant

Version: 0.1
Status: Implemented (Professional approved-plan assistant v1)

> **Scope note (ADR-013).** This assistant answers from **approved options
> only**. That is **safe but intentionally incomplete** — it is not the whole
> product vision. The core patient problem ("what can I eat instead of 100g egg
> whites?") needs **nutritional replacement intelligence**, delivered by
> **MVP-8** (replacement engine) and **MVP-9** (professional review/approval),
> with the patient-facing assistant arriving in **MVP-10**. Until then this
> assistant must NOT invent non-approved substitutions; it lists approved options
> and defers anything else to the professional. See
> `docs/MVP_8_NUTRITIONAL_REPLACEMENT_ENGINE.md`.

## Flow name

Plan-grounded assistant (professional-side).

## Goal

```txt
Authenticated professional
→ opens the assistant
→ asks a question about the SAVED plan
→ server verifies the session cookie
→ server loads the professional-owned plan from Firestore
→ server builds a minimal assistant context
→ server calls the OpenAI API
→ structured, grounded answer returned in the plan language
```

PlanPal is the source of truth; OpenAI is only the language engine.

## Core principle

The assistant answers **only** from the professional's saved Firestore plan and
its approved options. It does **not** create diets, prescribe/diagnose, override
the professional, or invent foods/quantities/substitutions.

## Audience

Professional-only, single-turn (ask → answer). Client-facing assistant is deferred.

## Route / UI

- API: `POST /api/assistant` (Node runtime).
- UI: dedicated page `/[locale]/professional/assistant`, linked from the builder
  header ("Open assistant" / "Apri l'assistente"). A focused plan-helper card
  (not a generic chatbot) with example chips, an answer card, a **safety badge**,
  a "grounded in your saved plan" note, and loading/empty/error/no-plan states.

## OpenAI

- Official `openai` Node SDK, **Responses API**, server-side only.
- Model configurable via `OPENAI_MODEL`.

> The model is configurable via `OPENAI_MODEL`. The current default should be
> verified against OpenAI's available API models at implementation time
> (at build time the recommended low-cost structured-output model was
> `gpt-5.4-mini`). If a configured model is unavailable, the server call fails
> and the UI shows a friendly localised error.

- **Structured output:** a `zod` `AssistantAnswer` schema via Structured Outputs
  (`responses.parse` + `zodTextFormat`). The server validates it and forces
  `groundedIn.planId`.

## Response shape

```ts
type AssistantAnswer = {
  answer: string;
  safetyLevel: "ok" | "needs_professional_review" | "refused";
  groundedIn: { planId: string; mealIds?: string[]; foodSlotIds?: string[] };
  suggestedFollowUpQuestions?: string[];
};
```

`safetyLevel` drives the badge: `ok` = grounded; `needs_professional_review` =
the assistant declined a substitution / flagged something not in the plan /
deferred to the professional; `refused` = out of bounds (new diet, medical
advice, anything outside the plan).

## Safety contract

Never: create a diet from scratch · prescribe/diagnose · override the
nutritionist · invent foods/quantities/substitutions · answer outside the saved
plan. May: explain the plan · summarise meals · list approved options · suggest
substitutions **only within the same FoodSlot** · shopping-list style summaries ·
draft professional-safe client explanations.

Substitution rule: a substitution is allowed only if both foods are approved
options in the **same FoodSlot**; otherwise the assistant says it is not an
approved substitution and to check with the professional.

## No-plan behaviour

If no saved plan exists, the route returns `{ noPlan: true }` **without calling
OpenAI**, and the UI shows a localised "save a plan first" message.

## Context minimisation

Sent to the model: plan title/language, meals, food slots, approved options, and
the patient's first name. NOT sent: the private client note, plan status/notes,
emails, billing, credentials, other clients/plans, or the system prompt. The
system prompt and `OPENAI_API_KEY` are never returned to the client. See
docs/SECURITY_BOUNDARIES.md (ADR-012).

## Locale

Answer language precedence: (1) `plan.language` if present; (2) otherwise the
active UI locale. Plans are authored in one language, so `plan.language` is
usually the source of truth. All visible UI copy is localised EN/IT.

## Environment

```txt
OPENAI_API_KEY   (server-only, required to enable the assistant)
OPENAI_MODEL     (optional; defaults to the recommended low-cost model)
```

Never expose `OPENAI_API_KEY` as `NEXT_PUBLIC_*`. Production key via host env vars.

## Guards (no full rate limiter yet)

Auth required · same-origin check · max question length (1000) ·
`max_output_tokens` (700) · no streaming · no anonymous access. **Known
limitation:** per-user rate limiting is required before broader pilot use.

## Out of scope

Client-facing assistant · assistant history persistence · streaming UI · per-user
rate limiting · voice · image/PDF import · nutrition-DB lookup · medical advice ·
automated plan generation · multi-client switching · rules dashboard.

## Next flow

Candidates: assistant history persistence
(`nutritionists/{uid}/patients/{pid}/questions/{qid}`), a rules-authoring screen
(so professional rules feed the context), or per-user rate limiting before pilot.
