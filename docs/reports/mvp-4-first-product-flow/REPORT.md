# Execution Report — MVP-4 First Product Flow

Date: 2026-06-08
Flow: Professional plan builder + live client preview
Doc: `docs/MVP_4_FIRST_PRODUCT_FLOW.md` · Decision: ADR-009 (`docs/DECISIONS.md`)

## Product flow implemented

A professional creates a client → structures a plan → adds meals → food slots →
approved options, with a **live, read-only client "today's plan" preview** beside
the builder that re-renders as they type. Closes the core PlanPal loop:
"if I build the plan like this, this is exactly what my client sees."

Reachable from the home "Plan editor" teaser. Localised EN/IT. A "Load example"
button seeds a populated sample (in the active locale); "Clear all" empties it.

## Route added

```txt
/[locale]/professional   →  /en/professional, /it/professional   (SSG per locale)
```

## Files created

- `apps/web/app/[locale]/professional/page.tsx` — server page; seeds a locale-correct example.
- `apps/web/lib/professional/types.ts` — builder draft types (mirror shared domain).
- `apps/web/lib/professional/reducer.ts` — immutable reducer + id factories.
- `apps/web/lib/professional/example-plan.ts` — locale-keyed example/empty seed.
- `apps/web/lib/professional/storage.ts` — localStorage load/save/clear (defensive).
- `apps/web/lib/professional/enums.ts` — meal/category/unit value lists.
- `apps/web/components/professional/professional-plan-builder.tsx` — stateful root (reducer + persistence + validation + layout).
- `apps/web/components/professional/{client-details-card,plan-details-card,meal-builder,meal-editor-card,food-slot-editor,food-option-editor,client-plan-preview}.tsx`
- `apps/web/components/professional/{fields,section-card}.tsx` — form primitives + card/remove helpers.
- `docs/MVP_4_FIRST_PRODUCT_FLOW.md`, `docs/reports/mvp-4-first-product-flow/*`

## Files updated

- `apps/web/components/app-shell.tsx` — `nav="minimal"` mode + locale-aware logo (links home).
- `apps/web/components/action-pill.tsx` — `localeHref` (locale-aware links) + `onClick`.
- `apps/web/app/[locale]/page.tsx` — home "Plan editor" teaser now links into the builder.
- `apps/web/messages/{en,it}.json` — `builder`, `mealNames`, `foodCategories`, `foodUnits` namespaces.
- `packages/shared/src/types/patient.ts` — added optional `note?`.
- `docs/DECISIONS.md` (ADR-009), `docs/UI_REGISTRY.md` (v0.6), `memory.md`.

## Data model used (no parallel concepts)

```txt
Patient (+ optional note) → MealPlan → Meal → FoodSlot → FoodOption
SupportedLocale · PlanStatus · MealName · FoodCategory · FoodUnit
```

Builder *draft* types (`lib/professional/types.ts`) mirror these field-for-field
using the shared enums; the only difference is an in-progress empty `quantity`.

## Persistence choice

**Local React state (`useReducer`) + `localStorage`. No Firestore, no auth.**

Reason (ADR-009): Firebase Auth is not wired up — there is no authenticated
`nutritionistId` to own writes, and `docs/SECURITY_BOUNDARIES.md` requires writes
under `nutritionists/{nutritionistId}` with clear ownership. So the flow ships
with no cloud writes and no secret exposure. The state shape maps field-for-field
onto the Firestore schema, so cloud persistence later is a mapping, not a rewrite.

The interactive builder is **client-rendered after the localStorage draft is
restored** (server renders a skeleton). This keeps edits surviving locale switches
(the page remounts per locale) and avoids hydration mismatches on the form.

## Review pass findings

- **Plan-status consistency (fixed):** the preview badge is now status-derived —
  draft → "Draft/Bozza" + warning; draft + "Preview as active" → "Preview/Anteprima",
  no warning; active → "Active/Attivo", no warning. Removed the contradictory
  "Active plan" badge shown alongside a draft warning; success banner reworded to
  status-neutral. Rule documented in UI_REGISTRY v0.6.
- **Domain alignment:** PASS — builder types import `@planpal/shared` and use the
  exact domain field names; no parallel concepts.
- **Localisation EN/IT:** PASS — 161 = 161 keys, zero orphans, no hardcoded
  user-facing strings in flow components.
- **Responsive:** builder is two-column on `lg`, stacks on mobile; option rows use
  responsive grids; verified on iOS simulator (iPhone 17).
- **UI consistency:** PASS — uses the documented tokens, form primitives,
  `SectionCard`, and pill controls (UI_REGISTRY).
- **Persistence safety:** PASS — no secrets, no Firestore writes; localStorage
  reads are guarded/defensive.

## Checks run (outputs in this folder)

| Command | Result | File |
| --- | --- | --- |
| `npm run typecheck` | PASS (exit 0) | `typecheck.txt` |
| `npm run lint` | PASS (exit 0) | `lint.txt` |
| `npm run build` | PASS (exit 0) — `/en/professional` + `/it/professional` prerendered | `build.txt` |

## Known limitations (intentional)

- Drafts are per-browser (localStorage), not synced or backed up.
- No auth / Firestore / client login; single client + plan at a time.
- "Preview as active" is an ephemeral preview toggle (does not change stored status).
- A brief skeleton shows before the builder hydrates.
- Not built: assistant route, substitution engine, shopping-list logic, archived
  status, billing, clinic accounts, PDF/image/nutrition DB.

## Next recommended flow

Add Firebase Auth for the professional, then map the builder state to Firestore
under `nutritionists/{uid}/...` per `docs/MVP_2_FIRESTORE_SCHEMA.md` and
`docs/SECURITY_BOUNDARIES.md` (resolve auth ownership first). Needs its own
architect blueprint.
