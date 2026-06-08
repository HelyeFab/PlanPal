# PlanPal MVP 4 — First Product Flow

Version: 0.1
Status: Implemented

## Flow name

Professional plan builder + client preview.

## Goal

Deliver the first usable core loop:

```txt
Professional creates a client
→ creates a structured nutrition plan
→ adds meals, food slots and approved options
→ previews the client-facing "today's plan" view
```

This closes the product loop: "if I build the plan like this, this is exactly
what my client sees." It is the foundation that later assistant answers,
substitutions and shopping lists read from.

## User

The professional (nutritionist). No client login is involved in this flow.

## Route

```txt
/[locale]/professional   →  /en/professional, /it/professional
```

Reachable from the home page "Plan editor" teaser. Statically generated per
locale; the builder itself is an interactive client component.

## Steps

1. **Client** — name, optional private note, preferred plan language (en/it).
   The preferred language seeds the plan language.
2. **Plan details** — title, status (draft/active), language, optional note.
3. **Meals** — add meals (name from the `MealName` set, display name, time,
   notes).
4. **Food slots** — per meal: label, category, required flag, notes.
5. **Approved options** — per slot: food name, quantity, unit, default flag.
6. **Client preview** — a live, read-only "today's plan" panel that re-renders
   from the builder state as the professional types. In-progress/empty options
   are hidden (a client would never see them). Draft plans show a "not visible
   to the client yet" notice.

A "Load example" action fills a populated sample plan (authored in the active
locale); "Clear all" resets to an empty plan.

## Data model used

Reuses the documented domain (docs/MVP_1_DATA_MODEL.md):

```txt
Patient      (extended with optional `note`)
MealPlan     (status draft/active, language)
Meal         (MealName, displayName, timeLabel, notes)
FoodSlot      (label, FoodCategory, required, notes, options)
FoodOption   (foodName, quantity, FoodUnit, notes, isDefault)
SupportedLocale
```

The builder uses *draft* shapes (`lib/professional/types.ts`) that mirror these
field-for-field, allowing an in-progress empty `quantity`. No parallel domain
concepts were introduced.

## Persistence

Local React state (`useReducer`) + `localStorage` only. There is no auth or
Firestore write in this flow (ADR-009). The state shape maps field-for-field
onto the Firestore schema, so adding persistence later is a direct mapping.

## Localisation

Fully localised (en/it). New message namespaces: `builder`, `mealNames`,
`foodCategories`, `foodUnits`. Example plan *data* is locale-keyed in
`lib/professional/example-plan.ts` (a plan is authored in one language).

Chosen Italian terminology of note:

```txt
Food slots        → Spazi alimentari
Approved options  → Opzioni approvate
Client preview    → Anteprima cliente
Plan builder      → Editor del piano
```

## Out of scope (intentionally not built)

```txt
real client authentication / invite flow
Firestore writes / persistence to the cloud
AI assistant route, substitution engine, shopping-list generation
archived plan status, multiple clients/plans per professional
billing, clinic accounts, PDF import, image upload, nutrition database
advanced validation
```

## Validation

Lightweight, surfaced as a "before this plan is ready" checklist beside the
preview: client name required, plan title required, every option needs a food
name. Quantities are numeric by input type.

## Next flow

Add real persistence: Firebase Auth for the professional, then map the builder
state to Firestore under `nutritionists/{uid}/...` per docs/MVP_2 and
docs/SECURITY_BOUNDARIES.md (resolve auth ownership first). After that: a real
client-facing read of the active plan, then the assistant route.
