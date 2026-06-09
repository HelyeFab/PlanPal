# Execution Report — MVP-9 Professional Review & Approval of Suggested Replacements

Builds on MVP-8b (ADR-015/016). The professional reviews/edits a deterministic
candidate and approves it into the plan as an ordinary approved `FoodOption`.
**Professional-only; no patient access (MVP-10); no auto/bulk approval; no
override of `not_suitable`.** Doc: `docs/MVP_9_PROFESSIONAL_REVIEW_APPROVAL.md`.

## Routes added

| Route | Purpose |
| --- | --- |
| `POST /api/replacements/approve` | Append an approved FoodOption to the owned slot (Node, cookie-verified) |

## Files created

- `apps/web/app/api/replacements/approve/route.ts`
- `apps/web/lib/replacements/approve.ts` — pure payload validation/whitelisting
- `apps/web/components/replacements/approve-replacement-modal.tsx`
- `docs/MVP_9_PROFESSIONAL_REVIEW_APPROVAL.md`, this report folder

## Files updated

- `packages/shared/src/types/replacement.ts` — candidate `nutrition?/role?/replacementGroupId?`; `ApprovedFromCandidate`; `ReplacementSource`
- `packages/shared/src/types/meal-plan.ts` — `FoodOption.approvedFromCandidate?`; `index.ts`
- `apps/web/lib/replacements/engine.ts` — candidates carry scaled nutrition/role/groupId
- `apps/web/lib/replacements/client.ts` — `approveReplacement`
- `apps/web/lib/professional/{types.ts, firestore-mapping.ts}` — provenance passthrough (validate/write/read)
- `apps/web/components/replacements/replacement-tester.tsx` — Approve CTA + modal + re-run
- `apps/web/messages/{en,it}.json` — approval/modal keys
- Docs: ADR-016, MVP_8 (status), UI_REGISTRY (v1.2, modal pattern), SECURITY_BOUNDARIES, memory

## Approval model

Approved replacement = an ordinary `FoodOption` appended to the original
`FoodSlot` (no parallel model). Focused `POST /api/replacements/approve`
(server-loads the owned plan, locates the slot, de-dups by normalised foodName,
appends one option + provenance, writes only the affected slot + `plan.updatedAt`)
— **not** `PUT /api/plan` (avoids clobbering the full draft). A review/edit modal
lets the professional adjust quantity/unit/role/macros/notes; the server
re-validates. Provenance `FoodOption.approvedFromCandidate{source,classification,
confidence,approvedAt}` is additive/optional, plumbed through firestore-mapping so
it survives later builder saves.

## Security

Node; same-origin; verified session cookie; `uid` from cookie only; owned plan
only; writes only under `nutritionists/{uid}`; payload validated; provenance
`approvedAt` server-stamped; de-dup, no overwrite. No OpenAI, no new secret.

## Checks run (outputs in this folder)

| Command | Result | File |
| --- | --- | --- |
| `npm run typecheck` | PASS (exit 0) | `typecheck.txt` |
| `npm run lint` | PASS (exit 0) | `lint.txt` |
| `npm run build` | PASS (exit 0) — `/api/replacements/approve` dynamic | `build.txt` |

## Live verification (2026-06-09, isolated test UID, cleaned up) — 11/11 PASS

Plan: egg whites slot + a "Lean protein" group (turkey). Asking for replacements
for the egg whites, then approving the turkey candidate with **edited** values:

1. Turkey candidate → `nutritionally_similar`. ✓
2. Approve (edited quantity 50, role, macros) → `ok`. ✓
3. Re-run search → turkey now classified `approved`. ✓
4. GET plan → approved option exists in the slot. ✓
5. Edited quantity persists (50). ✓
6. Edited macros persist (protein 15, calories 69). ✓
7. Edited role persists (`lean_protein`). ✓
8. `isDefault` is false. ✓
9. Provenance recorded (`source=replacement_group`, `classification`, `approvedAt`). ✓
10. Duplicate approve → `duplicate:true` (no overwrite). ✓
11. Provenance survives a later builder save (PUT round-trip preserves it). ✓

Guards: `POST /api/replacements/approve` no cookie → 401; no origin → 403. EN/IT
parity 309=309. (`not_suitable` has no Approve CTA — verified in the UI code.)

Verification used an Admin custom-token session; test data written under a
throwaway UID and removed via `recursiveDelete`; script not committed.

## Out of scope

Patient access / patient assistant (MVP-10); automatic or bulk approval; override
of `not_suitable`; OpenAI explanation; assistant history; nutrition database.

## Next

**MVP-10 — Patient access + patient assistant** (patient login/access mapping +
a careful patient-facing assistant exposing only approved options). Do not start
until MVP-9 is reviewed.
