# Execution Report — MVP-10a Patient Replacement Experience Prototype

Patient-experience-first (ADR-017). A faithful, patient-styled render of the
replacement flow, **behind the existing professional session** — no patient auth,
schema, or new API. Revised sequencing: **10a experience → 10b access → 10c assistant.**
Doc: `docs/MVP_10A_PATIENT_REPLACEMENT_PROTOTYPE.md`.

## Route added

| Route | Purpose |
| --- | --- |
| `/[locale]/professional/patient-preview` | Patient-styled preview of the owned plan (server-gated + RequireAuth) |

## Files created

- `apps/web/lib/patient/present.ts` — pure `presentReplacements()` (engine result → patient buckets)
- `apps/web/components/patient/patient-plan-view.tsx` — calm meal cards, tappable foods
- `apps/web/components/patient/patient-replacement-sheet.tsx` — bottom-sheet/modal, 3 buckets
- `apps/web/app/[locale]/professional/patient-preview/page.tsx`
- `docs/MVP_10A_PATIENT_REPLACEMENT_PROTOTYPE.md`, this report

## Files updated

- `apps/web/app/[locale]/professional/page.tsx` — "Preview as client" header link
- `apps/web/messages/{en,it}.json` — `patientPreview` namespace + `builder.openPatientPreview`
- Docs: ADR-017, UI_REGISTRY (v1.3), memory

## Presentation model (pure, reusable)

`presentReplacements()` maps engine output to three buckets, exposing only
`{ foodName, quantity?, unit?, reasonKey }`:

| Engine | Bucket | Reason keys |
| --- | --- | --- |
| `approved` | You can use | `approved_in_plan` |
| `nutritionally_similar`, `needs_professional_review` | Ask your professional | `similar_role`, `incomplete_nutrition` |
| `not_suitable` | Not a good match (collapsed) | `too_different` |

No classification names, confidence, reason/caution codes, tolerance, source,
macros, provenance, or `replacementGroupId` are emitted. Designed to run
server-side in the real patient route (MVP-10c).

## Wording

Approved → "You can use {amount} … approved in your plan." Candidate → "Not approved
in your plan yet. Ask your professional before using it." (amount framed as "possible
amount to discuss"). Not a good match → "too different for this part of your plan."
A non-approved candidate is never presented as allowed.

## Prototype boundary (security)

Route is professional-only (existing server gate + RequireAuth); reads only the
owned plan + owned engine; **no new auth/schema/API**. Simplification is client-side
— acceptable for a professional-only prototype; the real patient route (MVP-10c)
must minimise server-side. No new secret.

## Checks run (outputs in this folder)

| Command | Result | File |
| --- | --- | --- |
| `npm run typecheck` | PASS (exit 0) | `typecheck.txt` |
| `npm run lint` | PASS (exit 0) | `lint.txt` |
| `npm run build` | PASS (exit 0) — `/professional/patient-preview` dynamic | `build.txt` |

EN/IT parity: 336 = 336.

## `present()` unit test (real module via `--experimental-strip-types`)

7/7 meaningful: `can_use=[Yogurt greco]` (`approved_in_plan`, qty 170);
`ask_professional=[turkey (similar_role), cottage cheese (incomplete_nutrition)]`;
`not_a_good_match=[Avocado]` (`too_different`, no quantity); **output objects expose
only patient-safe keys** (no internals). (A substring check that flagged "nutrition"/
"role" inside the patient reason keys `incomplete_nutrition`/`similar_role` was a
test artefact, not a leak.)

## Browser E2E (real sign-in, non-destructive temp data) — 11/11 meaningful PASS

Drove a real Firebase sign-in (so `RequireAuth` passes), added a temporary patient +
group (most-recent during the test, deleted after — the account's real plan untouched):

- Client preview banner shown.
- Meal card "Colazione" + time "07:30"; planned foods Albumi + Yogurt greco.
- Tap Albumi → sheet "Invece di Albumi" + role sentence ("…proteine magre…colazione").
- **You can use** → Yogurt greco 170; **Ask your professional** → Petto di tacchino +
  Fiocchi di latte with "informazioni nutrizionali incomplete"; **Not a good match**
  collapsed → Avocado appears only after expand.
- **No engine internals in the DOM** (no classification/confidence/source/tolerance/…)
  and no raw macro numbers. (One assertion flagged "protein" as a substring of the
  Italian role label "proteine magre" — intentional patient wording, not a macro.)
- Route guard: signed-out → 307 to sign-in.

Verification used an Admin custom-token cookie for seeding + a real browser sign-in;
temp patient/group removed via `recursiveDelete`/`delete`; script not committed.

## Out of scope

Patient auth, `clientAccounts` mapping, invite/provisioning, the patient assistant +
history, patient editing, approval controls, calendar scheduling, medical advice.

## Next

**MVP-10b — Patient access / account mapping**, then **MVP-10c — Patient assistant**
(calls `present()` server-side + rate limiter). Stop and report before 10b.
