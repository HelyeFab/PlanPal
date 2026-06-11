# PlanPal MVP 10a — Patient Replacement Experience Prototype

Version: 0.2
Status: Implemented — **conversational + safety modes is now the primary prototype** (ADR-018); the list-first preview below (ADR-017) remains as a plan-only view.

> The patient-facing replacement experience, prototyped **behind the existing
> professional session** before patient identity (MVP-10b) and the real patient
> assistant (MVP-10c).

## Primary: conversational assistant with safety modes (ADR-018)

Chat-first at `/[locale]/professional/patient-chat-preview` (`POST /api/patient-chat`).
The patient chats naturally; the **deterministic engine remains the only authority**
on what is allowed, and OpenAI is the language layer.

- **Flow:** message → OpenAI closed-set target identification (validated ids) →
  deterministic engine → server-built buckets (`presentReplacements()`) → OpenAI
  compose warm prose (+ exploratory ideas in Explore) → grounding validation → reply.
- **Safety modes (professional-preview toggle):** **Plan-safe** = approved only;
  **Guided** (default) = approved + ask_professional + not_a_good_match; **Explore**
  = Guided + OpenAI `exploratory_ideas` (capped ~5, always "not approved in your plan
  yet", approximate macros).
- **Guarantees:** approved/ask/not buckets are server-built (the model can't add to
  approved); only `approved` is "you can use"; exploratory is "ideas to discuss";
  grounding validation → deterministic Guided fallback on any failure.
- **Modules:** `lib/patient/{chat-types,chat-openai,chat-safety,chat-client}.ts`,
  `app/api/patient-chat/route.ts`, `components/patient/{patient-chat,chat-answer}.tsx`.
- See ADR-018 for the sales story (Explore/Plan-safe/Guided ↔ Version A/B/C).

The remainder of this doc describes the earlier list-first preview (ADR-017), kept
as a plan-only view.

---

## List-first preview (ADR-017 — secondary)

## Goal

Let a patient look at a planned food and get a clear, safe answer to "what can I
eat instead?" — framed entirely around *their plan*, never implying approval for
anything unreviewed.

```
Open my plan → see meals → tap "Albumi 100g" → "What instead?"
→ You can use:           Yogurt greco 170g      (approved in your plan)
→ Ask your professional: Petto di tacchino 37g
                         Fiocchi di latte — nutrition info is incomplete
→ Not a good match:      Avocado — too different for this part of your plan
```

## Route & data source

- **Route:** `/[locale]/professional/patient-preview` — server-gated + client
  `RequireAuth`, reached via a **"Preview as client"** link in the builder header.
- **Data:** the professional's own current saved plan (`GET /api/plan`) + the MVP-8b
  engine (`POST /api/replacements`). **No new auth, API, or schema.**
- **Not** a real patient route: it shows the professional what their client would
  see. Real patient auth + server-side minimisation are MVP-10b/10c.

## Patient buckets (presentation model)

`lib/patient/present.ts` → `presentReplacements()` (pure, reusable) maps engine
output to three buckets, exposing only `{ foodName, quantity?, unit?, reasonKey }`:

| Engine classification | Bucket | Reason keys used |
| --- | --- | --- |
| `approved` | **You can use** | `approved_in_plan` |
| `nutritionally_similar`, `needs_professional_review` | **Ask your professional** | `similar_role`, `incomplete_nutrition` |
| `not_suitable` | **Not a good match** (collapsed) | `too_different` |

It emits **no** classification names, confidence, reason/caution codes, tolerance,
source, macros, provenance, or `replacementGroupId`. The UI localises the reason keys.

## Wording (patient vs professional)

- Approved: "You can use {amount} … approved in your plan."
- Candidate: "Not approved in your plan yet. Ask your professional before using it."
  Amounts framed as "possible amount to discuss: about {amount}".
- Not a good match: "too different for this part of your plan."

A non-approved candidate is **never** shown as allowed.

## What patients see / don't see

**See:** meal cards (time + name), approved foods (name + amount), the role/meal
sentence, the three buckets with plain reasons. **Don't see:** replacement groups,
tolerances, the macros editor, classification names, confidence, provenance,
`replacementGroupId`, source, Firestore paths, the professional's private note,
draft internals, other patients.

## Relationship to MVP-8 / MVP-9

MVP-8b classifies; MVP-10a re-skins that output in patient language. MVP-9 approval
is the bridge: approving a candidate makes it an approved `FoodOption`, so the engine
returns it as `approved` → it moves from "Ask your professional" into "You can use".

## Prototype boundary (security)

The route is professional-only, so simplification happens **client-side**. The real
patient route (MVP-10c) **must** call `presentReplacements()` (or equivalent)
**server-side** and minimise before anything reaches an actual patient. No new
secret, auth, or schema is introduced here.

## Verification

- typecheck / lint / build: pass. EN/IT parity: 336 = 336.
- `present()` unit test (real module): buckets + reason keys correct; output exposes
  only patient-safe keys (no internals).
- Browser E2E (real sign-in, non-destructive temp data): preview banner, meal card,
  tap → sheet with role sentence, You-can-use / Ask-professional / Not-a-good-match
  buckets correct, collapse/expand, **no engine internals or raw macros in the DOM**.
- Route guard: signed-out → 307 to sign-in.

## Out of scope (later phases)

Patient auth, `clientAccounts` mapping, invite/provisioning, the patient assistant +
history, patient editing, approval controls, calendar/day scheduling, medical advice.

## Next

**MVP-10b — Patient access / account mapping**, then **MVP-10c — Patient assistant**.
