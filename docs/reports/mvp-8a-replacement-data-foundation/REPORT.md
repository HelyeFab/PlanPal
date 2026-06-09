# Execution Report — MVP-8a Replacement Data Foundation

First internal pass of MVP-8 (ADR-013 / ADR-014). **Data foundation only** — the
deterministic engine + results UI are MVP-8b and are NOT built here.
Spec: `docs/MVP_8_NUTRITIONAL_REPLACEMENT_ENGINE.md`.

## What this pass adds

- Shared replacement/nutrition types.
- Optional, additive `FoodOption` fields: `nutrition?`, `role?`, `replacementGroupId?`.
- Firestore mapping for the new option fields (write + read + validation).
- A collapsed "Nutrition & role" editor on each food option.
- Owned `nutritionists/{uid}/replacementGroups` collection + `/api/replacement-groups`.
- A minimal professional group manager at `/[locale]/professional/replacements`.
- EN/IT localisation for all of the above.

## Routes added

| Route | Purpose |
| --- | --- |
| `GET/PUT/DELETE /api/replacement-groups` | Manage owned replacement groups (Node, cookie-verified) |
| `/[locale]/professional/replacements` | Server-gated group manager page |

## Files created

- `packages/shared/src/types/nutrition.ts` (`NutritionalProfile`, `FoodRole`, `FOOD_ROLES`)
- `packages/shared/src/types/replacement.ts` (classifications, tolerance, groups, request/candidate/result, `categoryToDefaultRole`)
- `apps/web/lib/replacements/{groups-mapping.ts (pure validate/whitelist), groups-client.ts (editable shapes + fetch)}`
- `apps/web/app/api/replacement-groups/route.ts`
- `apps/web/app/[locale]/professional/replacements/page.tsx`
- `apps/web/components/replacements/{replacement-group-manager.tsx, group-editor-card.tsx}`

## Files updated

- `packages/shared/src/types/meal-plan.ts` (FoodOption optional fields), `index.ts` (exports)
- `apps/web/lib/professional/types.ts` (`BuilderNutrition`, BuilderOption fields), `firestore-mapping.ts` (map/validate new fields)
- `apps/web/components/professional/food-option-editor.tsx` ("Nutrition & role" section)
- `apps/web/app/[locale]/professional/page.tsx` (header link), `messages/{en,it}.json`
- Docs: ADR-014, MVP_1, MVP_2, MVP_8 (status), UI_REGISTRY (v1.0), memory

## Data model (additive, backward-compatible)

`FoodOption.{nutrition?, role?, replacementGroupId?}`; new `NutritionalProfile`,
`FoodRole` (distinct from `FoodCategory`), and `ReplacementGroup` at
`nutritionists/{uid}/replacementGroups/{groupId}`. Default tolerance ±20% cal /
±20% protein / ±5g fat — initial MVP defaults, not clinical rules. Macros entered
manually; never invented.

## Security

Group routes reuse the MVP-6 boundary: same-origin + verified session cookie,
`uid` from the cookie only, Admin SDK under `nutritionists/{uid}`, covered by the
deployed `request.auth.uid == nutritionistId` rules. No new secret (no OpenAI in
8a).

## Checks run (outputs in this folder)

| Command | Result | File |
| --- | --- | --- |
| `npm run typecheck` | PASS (exit 0) | `typecheck.txt` |
| `npm run lint` | PASS (exit 0) | `lint.txt` |
| `npm run build` | PASS (exit 0) — new route + API dynamic | `build.txt` |

## Live verification (2026-06-09, isolated test UID, cleaned up) — 8/8 PASS

Against live `planpal-11ff7` via an Admin custom-token session:

- Guards: `GET /api/replacement-groups` no cookie → 401; `PUT` no origin → 403;
  `/it/professional/replacements` signed-out → 307 → sign-in. EN/IT parity 254=254.
- Group CRUD: PUT group → 200; GET returns it with role/tolerance/member + macros
  persisted; DELETE → 200; group gone after delete.
- Option round-trip: PUT a plan whose option has `role` + `nutrition` → GET → the
  `role` and macros round-trip intact (firestore-mapping handles the new fields).

Test data was written under a throwaway UID and removed via `recursiveDelete`;
the verification script was deleted, not committed.

## Out of scope (this pass)

The deterministic engine, `POST /api/replacements`, the results UI, the "Find
replacements" entry point, MVP-9 approval, and any patient exposure — all MVP-8b
or later.

## Next

**MVP-8b — Deterministic replacement engine + results UI.** Awaiting go-ahead per
the staged plan (report after 8a before building 8b).
