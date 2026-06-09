# PlanPal MVP 9 — Professional Review & Approval of Suggested Replacements

Version: 0.1
Status: Implemented

> Builds on MVP-8b (ADR-015). Lets the professional review a deterministic
> replacement candidate and approve it into the plan. Professional-only; **no
> patient access (MVP-10), no automatic/bulk approval, no override of
> `not_suitable`.** See ADR-016.

## Goal

Turn a deterministic candidate (e.g. *Petto di tacchino 37g, nutritionally_similar,
high*) into an **approved `FoodOption`** in the original `FoodSlot` — after the
professional reviews/edits it.

## Core rule

Approved replacement = an ordinary `FoodOption` appended to the same `FoodSlot`.
No parallel approval model; the plan stays `MealPlan → Meal → FoodSlot →
FoodOption`. This keeps later patient-facing logic simple.

## Flow

```txt
Candidate (Needs review) → "Approve" → review/edit modal → confirm
→ POST /api/replacements/approve
→ server verifies session cookie → loads the owned plan → locates the slot
→ de-dups by normalised foodName
→ appends ONE approved FoodOption (with provenance) to the slot
→ writes only the affected slot doc + plan.updatedAt
→ UI re-runs the engine search → the candidate now appears under Approved
```

## API

`POST /api/replacements/approve` (Node runtime). Body:

```ts
{
  mealId: string;
  foodSlotId: string;
  option: { foodName; quantity?; unit; notes?; role?; nutrition?; replacementGroupId? };
  provenance: { source; classification; confidence };
}
```

Returns `{ ok: true, optionId }`, or `{ ok: true, duplicate: true }` when a
normalised `foodName` already exists in the slot. Guards: same-origin, verified
session cookie, `uid` from cookie only, owned plan only, validated payload.

## Candidate → FoodOption mapping

```txt
candidate.foodName            → FoodOption.foodName
suggested or edited quantity  → FoodOption.quantity
candidate or edited unit      → FoodOption.unit
candidate or edited nutrition → FoodOption.nutrition
candidate or edited role      → FoodOption.role
candidate.replacementGroupId  → FoodOption.replacementGroupId
isDefault                     → false
notes                         → professional note or empty
provenance                    → FoodOption.approvedFromCandidate (server-stamped approvedAt)
```

The engine (MVP-8b) now surfaces the candidate's scaled `nutrition`, `role`, and
`replacementGroupId` so the modal can pre-fill.

## Editing before approval

A modal lets the professional adjust **quantity, unit, role, macros, notes**
before confirming. The server re-validates all edited values (enums, numbers).

## Duplicate handling

Within the target slot, a normalised `foodName` match → no new option, return
`duplicate: true`, UI shows "Already approved". No automatic overwrite.

## Provenance / audit

```ts
FoodOption.approvedFromCandidate?: {
  source: ReplacementSource;
  classification: ReplacementClassification;
  confidence: ReplacementConfidence;
  approvedAt: string; // server-stamped ISO
}
```

Additive/optional; **not** editable in the option editor; **preserved by
firestore-mapping and later builder saves**. Records that an option came from the
replacement engine and how confident the match was.

## UI

On `/[locale]/professional/replacements`, in the tester results:

- **Needs review** candidates → an **"Approve"** pill (opens the review/edit modal).
- **Approved** candidates → an **"Already approved"** chip (no CTA).
- **Not suitable** → no approval CTA.
- Modal: food name, editable quantity/unit/role/macros/notes, reason/caution
  context, a safety line — *"Approving this candidate will add it to the client's
  approved options for this meal slot."* — confirm/cancel, submitting/error states.
- After approval, the search re-runs so the candidate moves under Approved.

## Security

Node; same-origin; verified session cookie; `uid` from cookie only; load only the
owned plan; write only under `nutritionists/{uid}` (deployed rules
`request.auth.uid == nutritionistId`); validate the payload. No OpenAI, no new secret.

## Out of scope

Patient access / patient assistant (MVP-10); automatic or bulk approval; an
approval override for `not_suitable`; an OpenAI explanation layer; assistant
history; a nutrition database.

## MVP-10 connection

Approved replacements are ordinary approved `FoodOption`s, so the future patient
view/assistant reads approved options and sees them automatically; provenance
distinguishes an approved replacement from an original plan option.

## Next

**MVP-10 — Patient access + patient assistant** (patient login/access mapping +
a careful patient-facing assistant that only exposes approved options). Needs its
own architect blueprint.
