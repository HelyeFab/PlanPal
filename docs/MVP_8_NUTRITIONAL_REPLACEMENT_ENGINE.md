# PlanPal MVP 8 — Nutritional Replacement Engine

Version: 0.3
Status: MVP-8 IMPLEMENTED (8a data foundation + 8b deterministic engine)

> Replacement intelligence is based on **nutritional equivalence**, not
> approved-list lookup only (ADR-013). Shipped in two internal passes (ADR-014):
>
> - **MVP-8a — Replacement data foundation (DONE):** shared replacement/nutrition
>   types; optional `FoodOption.{nutrition,role,replacementGroupId}`; Firestore
>   mapping; collapsed "Nutrition & role" UI on each option; owned
>   `nutritionists/{uid}/replacementGroups` + `/api/replacement-groups` + group manager.
> - **MVP-8b — Deterministic engine + results UI (DONE, ADR-015):** pure engine
>   `lib/replacements/engine.ts`, `POST /api/replacements`, the
>   `/[locale]/professional/replacements` tester + grouped results, and the
>   "Find replacements" entry point on each food option. No OpenAI in classification.
>
> **Not yet:** approval into the plan (MVP-9) and any patient-facing surface (MVP-10).
> The sections below remain the spec for the whole of MVP-8.

## Product goal

Answer the core PlanPal patient question, given a plan:

> "What can I eat instead of 100g egg whites?"

The answer must consider the original food's nutritional **role** in the plan,
its **quantity**, **macros** where available, the **meal context**, the **food
slot/category**, and **professional constraints** — not just foods already
manually listed as approved options.

Crucially, every suggestion is **classified** for safety. A non-approved
replacement must NEVER be presented as automatically allowed.

## The core distinction

| Classification | Meaning | Allowed to present as "allowed"? |
| --- | --- | --- |
| `approved` | Explicitly approved in the plan or by the professional. | Yes. |
| `nutritionally_similar` | Appears to match the original food's nutritional role, but **requires professional review** unless already approved. | No — candidate only. |
| `needs_professional_review` | Plausible but uncertain / insufficient data. | No — defer to professional. |
| `not_suitable` | Too different, conflicts with the slot/plan, or lacks enough data. | No. |

## Example output (target behaviour)

```txt
Original:
  100g egg whites
Role:
  Lean protein portion for breakfast (slot: "Protein", category: protein)

Possible replacements:
- 150–170g 0% Greek yogurt   — approved (already an option in this slot)
- 80–100g low-fat ricotta    — nutritionally_similar (close protein role, slightly
                               different fat profile) → needs professional review
- 70–90g turkey/chicken breast — nutritionally_similar (similar lean protein role,
                               different food context) → needs professional review

Status:
  Non-approved candidates need professional review unless already approved.
```

## Concepts (new domain vocabulary)

```txt
FoodReplacementRequest      — "replace this plan food, in this slot/meal context"
FoodReplacementCandidate    — one suggested replacement, classified + reasoned
ReplacementClassification   — approved | nutritionally_similar | needs_professional_review | not_suitable
NutritionalProfile          — optional macros for a food/option
ReplacementReason           — why a candidate was suggested (code + human message)
ReplacementConfidence       — low | medium | high
```

### Suggested type shapes (to refine at implementation)

```ts
type ReplacementClassification =
  | "approved"
  | "nutritionally_similar"
  | "needs_professional_review"
  | "not_suitable";

type ReplacementConfidence = "low" | "medium" | "high";

type NutritionalProfile = {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fibre?: number;
};

type FoodReplacementCandidate = {
  foodName: string;
  suggestedQuantity?: number;
  unit?: string;
  classification: ReplacementClassification;
  confidence: ReplacementConfidence;
  reasons: string[];           // human-readable, localised (see ReplacementReason)
  cautions?: string[];
  source:
    | "approved_option"        // already an option in the same FoodSlot
    | "nutrition_database"     // matched via a trusted food DB
    | "model_suggestion"       // LLM-proposed (lowest trust — must be reviewed)
    | "professional_rule";     // from a professional-defined equivalence group
};

type FoodReplacementRequest = {
  planId: string;
  mealId: string;
  foodSlotId: string;
  originalFoodName: string;
  originalQuantity?: number;
  originalUnit?: string;
};

// ReplacementReason: a coded reason plus a localised message, e.g.
// { code: "similar_protein" | "different_fat_profile" | "same_category"
//        | "approved_in_slot" | "insufficient_data" | ..., message: string }
```

## Data model implications (documented, NOT implemented yet)

`FoodOption` (docs/MVP_1_DATA_MODEL.md / MVP_2) will likely need optional fields:

```txt
nutrition?: NutritionalProfile     // macros per the option's quantity/unit
role?: FoodRole                    // e.g. lean_protein, complex_carb, vegetable…
replacementGroupId?: string        // professional-defined equivalence group id
```

Do **not** add these to the model until MVP-8 is implemented. For now this doc
records the need so the schema can evolve deliberately (these are additive,
optional, and backward-compatible).

`FoodRole` is a new concept (a nutritional role, richer than `FoodCategory`) — to
be defined at implementation; it can start as a small enum aligned with category.

## Where the nutritional knowledge comes from

Accurate replacement needs ONE (or a hybrid) of:

1. **Nutrition values stored on plan food items** (`FoodOption.nutrition`) —
   precise but requires data entry by the professional.
2. **A trusted food nutrition database** (e.g. a curated/licensed macro DB) —
   broad coverage but an integration + licensing + matching problem.
3. **Professional-defined equivalence groups** (`replacementGroupId`) — the
   professional says "these foods are interchangeable in this slot". Safest and
   simplest; encodes professional judgement directly.
4. **A hybrid** of the above.

### Recommended safest MVP path

> **Start with professional-defined replacement groups plus optional macro
> fields. Do NOT rely purely on the LLM to invent replacements.**

Rationale: equivalence groups carry the professional's judgement (already
"review-approved" by construction), and optional macros let the engine reason
about similarity where data exists. The LLM is used to *explain and rank* — never
as the sole authority for whether a swap is allowed. Pure-LLM invention is unsafe
for a health-adjacent product and conflicts with ADR-003.

## Engine sketch (server-side)

```txt
FoodReplacementRequest
→ verify session cookie (reuse MVP-6 boundary) → uid
→ load the owned plan + the target meal/slot/option from Firestore
→ gather candidate sources, in trust order:
    1. approved options already in the same FoodSlot            → "approved"
    2. professional equivalence group for this option/slot      → "approved"
    3. macro-similarity vs stored nutrition (if present)        → "nutritionally_similar"
    4. (optional) LLM-ranked suggestions, grounded in the plan  → "model_suggestion" / "needs_professional_review"
→ classify + score each candidate; attach reasons + cautions
→ return FoodReplacementCandidate[] (never auto-allowed if not approved)
```

The engine is **server-side only**, reuses the verified session + Admin SDK, and
applies the same context-minimisation and secret-handling rules as MVP-7
(docs/SECURITY_BOUNDARIES.md). Any LLM step uses Structured Outputs and is
treated as a *suggestion source*, not an authority.

## Safety contract

- Non-approved candidates are **never** presented as allowed; they are labelled
  and require professional review.
- **Professional-facing** wording surfaces candidates for review
  ("not currently approved in the slot, but a possible candidate — review before
  showing the patient as allowed").
- **Patient-facing** wording (MVP-10) is more careful and never implies approval
  ("this looks similar, but it isn't approved in your plan yet — ask your
  professional to approve it").
- Insufficient data → `needs_professional_review` or `not_suitable`, never a
  confident guess.

## Scope

**MVP-8 does:** define the concepts/types; build the replacement *engine* that
produces classified candidates for the professional (request → candidates), using
approved options + professional equivalence groups (+ optional macros), with the
LLM as a ranking/explanation aid only; surface candidates in the professional UI
labelled by classification.

**MVP-8 does NOT:** approve candidates into the plan (that is **MVP-9**), expose
anything to patients (**MVP-10**), integrate a licensed food database (later
option), or auto-allow any non-approved swap.

## Open design questions

1. **Primary data source for v1** — equivalence groups only, or groups + optional
   macros? (Recommendation: both, macros optional.)
2. **`FoodRole` taxonomy** — start aligned with `FoodCategory`, or a richer
   nutritional role set?
3. **Equivalence-group authoring** — per-slot, per-option, or a reusable library
   of groups? Where does the professional define them (needs a small UI — relates
   to a future rules/groups dashboard)?
4. **LLM involvement** — ranking/explanation only (recommended), or also proposing
   candidates flagged `model_suggestion` + `needs_professional_review`?
5. **Macro source & units** — how are macros entered/normalised against an
   option's quantity/unit?
6. **Where MVP-8 surfaces** — a "find a replacement" action inside the builder/
   assistant for the professional.

## Next phase

**MVP-9 — Professional review and approval of suggested replacements:** the
professional reviews `FoodReplacementCandidate`s and approves chosen ones into the
plan (turning `nutritionally_similar` into `approved`), after which **MVP-10**
exposes patient access + a careful patient-facing assistant.
