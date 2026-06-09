# Execution Report — MVP-8b Deterministic Replacement Engine + Results UI

Second internal pass of MVP-8 (ADR-013/014/015). The deterministic engine + results
UI on the MVP-8a foundation. **No OpenAI in classification; approval is MVP-9;
nothing patient-facing (MVP-10).** Spec: `docs/MVP_8_NUTRITIONAL_REPLACEMENT_ENGINE.md`.

## Routes added

| Route | Purpose |
| --- | --- |
| `POST /api/replacements` | Deterministic replacement search (Node, cookie-verified) |
| `/[locale]/professional/replacements` | now hosts a tester + grouped results (above the group manager) |

## Files created

- `apps/web/lib/replacements/engine.ts` — pure deterministic engine
- `apps/web/lib/replacements/read-groups.ts` — server read of owned groups
- `apps/web/lib/replacements/client.ts` — client fetch wrapper
- `apps/web/app/api/replacements/route.ts`
- `apps/web/components/replacements/replacement-tester.tsx`

## Files updated

- `apps/web/app/[locale]/professional/replacements/page.tsx` (tester + manager + `searchParams`)
- `apps/web/components/professional/food-option-editor.tsx` (per-option "Find replacements" link)
- `apps/web/messages/{en,it}.json` (engine UI + `class`/`confidence`/`reasons`/`cautions` codes; relabelled link)
- Docs: ADR-015, MVP_8 (status), UI_REGISTRY (v1.1), memory

## Engine (deterministic, pure)

`findReplacements(plan, groups, request) → ReplacementResult`. No OpenAI, no I/O,
no randomness.

- **Candidate order:** approved-in-slot → explicit `replacementGroupId` →
  role-matched groups → same-role options elsewhere in the plan. De-duplicated by
  food name (approved wins).
- **Quantity scaling:** scale to the role's primary macro (lean_protein/protein →
  protein; carbohydrate → carbohydrates; fat → fat; else calories) →
  `suggestedQuantity`. Missing primary macro → no invented quantity →
  `needs_professional_review`.
- **Classification:** within tolerance (±20% cal/protein, ±5g fat) →
  `nutritionally_similar`; mildly outside (≤2×) → `needs_professional_review`;
  grossly outside → `not_suitable`; no candidates → `insufficientData`.
- **Reasons/cautions:** returned as codes, localised in the UI.
- **Sort:** approved → similar(high) → similar(medium) → needs review → not suitable.

## Security

`POST /api/replacements`: same-origin + verified session cookie; `uid` from the
cookie only; Admin SDK reads of the owned plan + groups under `nutritionists/{uid}`.
No OpenAI key. Candidates are professional-only and labelled "candidate for review";
no approval here.

## Checks run (outputs in this folder)

| Command | Result | File |
| --- | --- | --- |
| `npm run typecheck` | PASS (exit 0) | `typecheck.txt` |
| `npm run lint` | PASS (exit 0) | `lint.txt` |
| `npm run build` | PASS (exit 0) — `/api/replacements` dynamic | `build.txt` |

## Live verification (2026-06-09, isolated test UID, cleaned up) — 8/8 PASS

Setup: a saved plan with a "Proteine" slot (Albumi 100g {protein 11, cal 52, fat 0.2}
+ approved Yogurt greco) and a "Breakfast lean protein" group (turkey, avocado,
cottage-cheese-without-macros). Asking for replacements for the egg whites:

```
Yogurt greco       → approved / high (170g)              [approved option in same slot]
Petto di tacchino  → nutritionally_similar / high (37g)  [scaled to match 11g protein]
Fiocchi di latte   → needs_professional_review / low     [no macros]
Avocado            → not_suitable / low (550g)           [poor macro match]
Tè (no macros)     → insufficientData                    [safe fallback, no candidates]
```

- Approved option in same slot → `approved`. ✓
- Group candidate with close macros → `nutritionally_similar` + correct scaled quantity. ✓
- Group candidate with missing macros → `needs_professional_review`. ✓
- Poor macro/role match → `not_suitable`. ✓
- Original/candidate missing data → `insufficientData` safe fallback. ✓
- Guards: `POST /api/replacements` no cookie → 401; no origin → 403;
  `/it/professional/replacements` signed-out → 307. EN/IT parity 295=295. ✓

Verification used an Admin custom-token session; test data written under a
throwaway UID and removed via `recursiveDelete`; script not committed.

## Out of scope (this pass)

Approve candidate into the plan (MVP-9); patient-facing replacement UI / patient
assistant (MVP-10); an OpenAI explanation layer; a food nutrition database;
barcode; auto-substitution.

## Next

**MVP-9 — Professional review & approval of suggested replacements.** Do not start
until the deterministic engine behaviour is reviewed.
