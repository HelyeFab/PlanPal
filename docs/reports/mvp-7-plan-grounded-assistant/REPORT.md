# Execution Report — MVP-7 Plan-Grounded Assistant

Flow: professional asks → server verifies session → loads saved plan → minimal
context → OpenAI (server-side) → structured grounded answer.
Doc: `docs/MVP_7_PLAN_GROUNDED_ASSISTANT.md` · Decision: ADR-012.

## Routes added

| Route | Purpose |
| --- | --- |
| `POST /api/assistant` | Plan-grounded answer (Node runtime, cookie-verified) |
| `/[locale]/professional/assistant` | Server-gated assistant page (force-dynamic) |

## Files created

- `app/api/assistant/route.ts`
- `app/[locale]/professional/assistant/page.tsx`, `components/assistant/assistant-panel.tsx`
- `lib/assistant/{context,schema,instructions,openai,client}.ts`
- `lib/professional/read-plan.ts` (extracted saved-plan read; reused by `/api/plan` GET)
- `docs/MVP_7_PLAN_GROUNDED_ASSISTANT.md`, this report folder

## Files updated

- `app/api/plan/route.ts` — GET refactored to use `read-plan.ts`
- `app/[locale]/professional/page.tsx` — "Open assistant" link
- `messages/{en,it}.json` — `planAssistant` namespace + `builder.openAssistant`
- `packages/shared/src/types/assistant.ts` (+`AssistantAnswer`, `AssistantSafetyLevel`)
- `lib/env.ts` (OpenAI server env + `isOpenAIConfigured`), `.env.example`
- `docs/DECISIONS.md` (ADR-012), `docs/SECURITY_BOUNDARIES.md`, `docs/UI_REGISTRY.md` (v0.9), `memory.md`

## OpenAI

Official `openai` Node SDK, **Responses API**, server-side only;
`responses.parse` + `zodTextFormat` (Structured Outputs) → validated
`AssistantAnswer`. Model via `OPENAI_MODEL` (default `gpt-5.4-mini`, verified
against OpenAI's current available models at build time). `max_output_tokens`
700. Deps added: `openai`, `zod`.

## Env vars required

`OPENAI_API_KEY` (server-only, gitignored) + optional `OPENAI_MODEL`. Never
`NEXT_PUBLIC_*`.

## Safety / security

Same-origin + verified session cookie; `uid` (= `nutritionistId`) from cookie
only; plan read via Admin SDK under `nutritionists/{uid}`. Minimal context (no
private note, status/notes, emails, billing, other clients, or system prompt sent
to the model; key/prompt never returned to the client). Structured output;
`groundedIn.planId` forced server-side. Same-FoodSlot substitution rule. Guards:
auth, same-origin, max question 1000, `max_output_tokens` 700, no streaming, no
anonymous access. **Known limitation:** no per-user rate limiter yet.

## Checks run (outputs in this folder)

| Command | Result | File |
| --- | --- | --- |
| `npm run typecheck` | PASS (exit 0) | `typecheck.txt` |
| `npm run lint` | PASS (exit 0) | `lint.txt` |
| `npm run build` | PASS (exit 0) — `/api/assistant` + assistant page dynamic | `build.txt` |

## Live verification (2026-06-09)

Against live `planpal-11ff7` + real OpenAI key (`gpt-5.4-mini`), signed in as the
professional with a saved Italian example plan:

- **Approved options (lunch protein):** `ok` → lists "Petto di pollo 150 g (default), Tofu 200 g". ✓
- **Unsupported substitution (ricotta for breakfast yogurt):**
  `needs_professional_review` → "la ricotta non è elencata tra le opzioni
  approvate… va verificato con il professionista." (refuses + defers) ✓
- **New diet request:** `refused` → declines, offers to summarise the existing plan. ✓
- **Shopping list:** `ok` → lists only the plan's approved foods. ✓
- **No saved plan:** `{ noPlan: true }` returned **without** an OpenAI call. ✓
- **Language:** all answers in Italian (`plan.language`). `groundedIn.planId` forced. ✓
- **Guards:** `POST /api/assistant` no cookie → 401; no origin → 403;
  signed-out `/it/professional/assistant` → 307 → sign-in. EN/IT parity 203=203. ✓

Verification used an Admin custom-token session for the professional UID; the
script was removed and never committed.

## Known limitations

- No per-user rate limiter (required before broader pilot).
- No assistant history persistence (deferred).
- Professional-only; no client-facing assistant.
- Professional rules not yet authored (context.rules is empty until a rules UI exists).

## Trajectory note (ADR-013)

MVP-7 is **intentionally retained** as **"Professional approved-plan assistant
v1"**. Its strict approved-option-only behaviour is **safe but incomplete** for
the final patient-facing substitution vision: the core PlanPal question is "what
can I eat instead of 100g egg whites *without losing the nutritional purpose of
the plan*?", which needs nutritional replacement intelligence, not approved-list
lookup alone. Approved options remain the safest answer, but they are not the
whole product.

## Next recommended flow

**MVP-8 — Nutritional Replacement Engine** (see
`docs/MVP_8_NUTRITIONAL_REPLACEMENT_ENGINE.md`), then MVP-9 (professional
review/approval) and MVP-10 (patient access + patient assistant). The earlier
candidates (assistant history persistence, rules-authoring, per-user rate
limiting) are smaller follow-ups, not the main trajectory.
