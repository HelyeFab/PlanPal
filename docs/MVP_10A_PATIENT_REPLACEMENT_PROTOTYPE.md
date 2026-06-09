# PlanPal MVP 10a — Patient Replacement Experience Prototype

Version: 0.1
Status: Implemented

> The patient-facing replacement experience, prototyped **behind the existing
> professional session** before patient identity (MVP-10b) and the real patient
> assistant (MVP-10c). See ADR-017.

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
