# Execution Report — MVP-10a Conversational Replacement Assistant with Safety Modes

Chat-first patient prototype (ADR-018), **behind the existing professional session**
— no patient auth yet. The deterministic engine remains the **only** authority on
what is allowed; OpenAI is the language layer. Supersedes the list-first preview
(ADR-017) as the primary patient path.

## Routes added

| Route | Purpose |
| --- | --- |
| `POST /api/patient-chat` | Conversational replacement assistant (Node, cookie-verified, OpenAI) |
| `/[locale]/professional/patient-chat-preview` | Chat-first preview (server-gated + RequireAuth) |

## Files created

- `apps/web/lib/patient/chat-types.ts` — `SafetyMode`, `PatientReplacementBucket`, response shape
- `apps/web/lib/patient/chat-openai.ts` — closed-set identification + compose/explore calls
- `apps/web/lib/patient/chat-safety.ts` — bilingual deterministic fallback + grounding validation
- `apps/web/lib/patient/chat-client.ts` — client fetch wrapper
- `apps/web/app/api/patient-chat/route.ts` — orchestration
- `apps/web/components/patient/{patient-chat.tsx, chat-answer.tsx}`
- `apps/web/app/[locale]/professional/patient-chat-preview/page.tsx`

## Files updated

- `apps/web/app/[locale]/professional/page.tsx` — "Preview as client" now → chat preview
- `apps/web/messages/{en,it}.json` — `patientChat` namespace
- Docs: ADR-018, MVP_10A doc (status), UI_REGISTRY (v1.4), SECURITY_BOUNDARIES, memory
- Reuses `lib/patient/present.ts` + the MVP-7 OpenAI Responses-API/`zodTextFormat` pattern

## Flow & safety model

```
message → OpenAI closed-set target identification (validated ids; cannot invent)
→ deterministic engine → server-built buckets (presentReplacements())
→ OpenAI compose warm prose (+ exploratory ideas in Explore)
→ grounding validation → response
```
- **Modes (professional-preview toggle):** Plan-safe = approved only · Guided (default)
  = approved + ask_professional + not_a_good_match · Explore = Guided + OpenAI
  `exploratory_ideas` (cap 5, always "not approved", approximate macros).
- **Guarantees:** approved/ask/not buckets are server-built (the model cannot add to
  approved); only `approved` is "you can use"; exploratory is "ideas to discuss". On
  grounding-validation failure or OpenAI error → deterministic Guided fallback,
  exploratory dropped.
- OpenAI never classifies or decides approval. Two model calls/message, `OPENAI_MODEL`
  default, no streaming, input + output caps.

## Security

Professional session (same-origin + verified cookie + uid from cookie); OpenAI
server-side only; context minimised (food names/labels for identification; patient-safe
buckets for composition — never private note, provenance, tolerances, macros, codes).
**Still missing for real patients (10c):** per-user rate limiter; Explore off-by-default
for patients.

## Checks run (outputs in this folder)

| Command | Result | File |
| --- | --- | --- |
| `npm run typecheck` | PASS (exit 0) | `typecheck.txt` |
| `npm run lint` | PASS (exit 0) | `lint.txt` |
| `npm run build` | PASS (exit 0) — `/api/patient-chat` + page dynamic | `build.txt` |

EN/IT parity: 369 = 369.

## Live test (test UID + real OpenAI) — 14/14 PASS

Plan: breakfast protein {Yogurt greco (approved), Albumi (approved)} + a lean-protein
group {turkey, avocado, cottage-cheese-without-macros}. Asking about Greek yogurt:

- **Guided:** kind=answer; approved=[Albumi]; ask_professional=[turkey, cottage cheese];
  exploratory=[]; not=[avocado]; message references Albumi.
- **Plan-safe (strict):** approved only — ask/not/exploratory all empty.
- **Explore:** exploratory ideas generated (Egg whites, Low-fat cottage cheese, Turkey
  breast, Skyr, Protein-fortified yogurt); **every idea flagged `exploratory: true`**;
  **none in the approved bucket**; approved still only real plan foods.
- **Out-of-scope** ("600-calorie weight-loss diet") → refused.
- **Off-plan food** ("instead of pizza") → refused.
- **No engine internals** (classification/confidence/tolerance/source/replacementGroupId/…)
  in any response.
- Guards: `POST /api/patient-chat` no cookie → 401; no origin → 403; page signed-out → 307.

Verification used an Admin custom-token cookie + real OpenAI calls; temp data removed via
`recursiveDelete`; script not committed.

### Known limitation
Cross-language synonym dedup of exploratory ideas is imperfect (e.g. "Egg whites"
suggested as an idea while its Italian name "Albumi" is already approved). It is always
correctly labelled "not approved", so it is safe — just occasionally redundant.

## Out of scope

Real patient auth, `clientAccounts` mapping, invite flow, professional settings dashboard,
per-patient mode settings, food-database integration, medical claims, automatic
substitution, calorie-prescription changes, assistant history/memory, streaming.

## Next

**Patient auth — MVP-10b** (clientAccounts + patient accounts + provisioning + role
resolution), then **MVP-10c** (real patient route: present()/chat server-side minimised,
Explore off-by-default for patients, + rate limiter). Stop and report before 10b.
