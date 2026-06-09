# Memory — PlanPal App Scaffold

Last updated: 2026-06-09

## Latest: MVP-9 — Professional review & approval of replacements (DONE; stop before MVP-10)

The professional reviews a deterministic candidate (MVP-8b) and approves it into
the plan (docs/MVP_9_PROFESSIONAL_REVIEW_APPROVAL.md, ADR-016). Professional-only;
no patient access (MVP-10); no auto/bulk approval; no override of `not_suitable`.

- **Model:** approved replacement = an ordinary `FoodOption` appended to the
  original `FoodSlot` (no parallel model).
- **API:** `POST /api/replacements/approve` (Node, same-origin, verified session,
  uid from cookie only) — loads the owned plan, locates the slot, **de-dups by
  normalised foodName** (`duplicate:true`, no overwrite), appends ONE option with
  provenance, writes only the affected slot + `plan.updatedAt`. Focused endpoint,
  NOT `PUT /api/plan` (avoids clobbering).
- **Provenance:** `FoodOption.approvedFromCandidate?{source,classification,
  confidence,approvedAt}` — additive/optional, not editable in the option editor,
  **preserved by firestore-mapping + later builder saves** (plumbed through
  validate/write/read).
- **Engine enrichment:** candidates now carry scaled `nutrition`/`role`/
  `replacementGroupId` so the approval modal pre-fills.
- **UI:** Needs-review candidates get an **"Approve"** pill → a review/edit
  **modal** (first modal pattern — quantity/unit/role/macros/notes editable +
  safety line); approved → "Already approved" chip; not_suitable → no CTA. After
  approval the search re-runs (server truth).

New: `app/api/replacements/approve/route.ts`, `lib/replacements/approve.ts`,
`components/replacements/approve-replacement-modal.tsx`. Modified: shared
`replacement.ts` (candidate nutrition/role/groupId + `ApprovedFromCandidate`,
`ReplacementSource`), `meal-plan.ts` (FoodOption.approvedFromCandidate),
`lib/replacements/{engine,client}.ts`, `lib/professional/{types,firestore-mapping}.ts`
(provenance passthrough), `replacement-tester.tsx`, messages, docs (ADR-016,
MVP_9, MVP_8 status, UI_REGISTRY v1.2, SECURITY_BOUNDARIES).

**Checks:** typecheck ✓ · lint ✓ · build ✓ (`/api/replacements/approve`). EN/IT parity 309=309.
**Live-verified (isolated test UID, cleaned up) — 11/11:** approve nutritionally_similar
→ becomes approved FoodOption; re-run shows approved; edited quantity/role/macros persist;
isDefault false; provenance recorded + survives a builder save; duplicate→duplicate:true;
guards 401/403. Outputs in `docs/reports/mvp-9-professional-review-approval/`.

**Next: MVP-10 — Patient access + patient assistant** (patient login/access mapping +
careful patient-facing assistant exposing ONLY approved options). Do NOT start until
MVP-9 is reviewed. Needs its own architect blueprint.

---

## MVP-8b — Deterministic replacement engine + results UI (DONE)

Second pass of MVP-8 (ADR-013/014/015). The deterministic engine + results UI on
the 8a foundation. **No OpenAI in classification; no approval (MVP-9); nothing
patient-facing (MVP-10).**

- **Engine** (`lib/replacements/engine.ts`, pure): `(saved plan, owned groups,
  request) → ReplacementResult`. Candidate order: approved-in-slot → explicit
  `replacementGroupId` → role-matched groups → same-role-in-plan (deduped by name).
  Scales candidates to the role's **primary macro** (protein/carbs/fat/calories)
  for `suggestedQuantity`; classifies by tolerance (±20% cal/protein, ±5g fat):
  within → `nutritionally_similar`; mild → `needs_professional_review`; gross →
  `not_suitable`; none → `insufficientData`. Missing macros → safe fallback, never invented.
- **API:** `POST /api/replacements` (Node, same-origin, verified session, Admin SDK,
  reads owned plan + groups). No OpenAI key.
- **UI:** `/[locale]/professional/replacements` now has a **tester** (pick a saved
  food → grouped Approved / Needs review / Not suitable, with suggested quantity,
  confidence, localised reasons/cautions, "candidate for review" note) above the
  group manager. Per-option **"Find replacements"** link in the builder
  (`?mealId&foodSlotId&optionId`). Builder header link relabelled "Replacements".

New: `lib/replacements/{engine,read-groups,client}.ts`; `app/api/replacements/route.ts`;
`components/replacements/replacement-tester.tsx`. Modified: replacements page
(tester + manager + searchParams), `food-option-editor.tsx` (Find-replacements link),
messages (engine UI + `reasons`/`cautions`/`class`/`confidence` codes). Docs: ADR-015,
MVP_8 (status), UI_REGISTRY v1.1.

**Checks:** typecheck ✓ · lint ✓ · build ✓ (new `/api/replacements`). EN/IT parity 295=295.
**Live-verified (isolated test UID, cleaned up) — 8/8:** approved-in-slot→approved;
turkey (scaled to match protein)→nutritionally_similar (37g); avocado→not_suitable;
no-macro member→needs_professional_review; no-data option→insufficientData; guards 401/403/307.
Outputs in `docs/reports/mvp-8b-deterministic-replacement-engine/`.

**Next: MVP-9 — professional review/approval of suggested replacements** (approve a
candidate → append as an approved FoodOption in the slot). Do NOT start until the
8b engine behaviour is reviewed. Then MVP-10 (patient access + patient assistant).

---

## MVP-8a — Replacement data foundation (DONE)

First pass of MVP-8 (ADR-013/ADR-014). **Data foundation only — the deterministic
engine + results UI are MVP-8b, NOT built yet.**

- **Shared types:** `NutritionalProfile`, `FoodRole` (+`FOOD_ROLES`), and the
  replacement types (`ReplacementClassification/Confidence/Tolerance`,
  `ReplacementGroup(+Member)`, `FoodReplacement{Request,Candidate}`,
  `ReplacementResult`, `DEFAULT_REPLACEMENT_TOLERANCE`, `categoryToDefaultRole`).
- **FoodOption** gained optional additive fields: `nutrition?`, `role?`,
  `replacementGroupId?` (builder draft + `firestore-mapping` map them; blanks omitted).
- **Replacement groups:** owned collection `nutritionists/{uid}/replacementGroups`
  + `/api/replacement-groups` (GET/PUT/DELETE, Node, session-verified, Admin SDK,
  same-origin) + a minimal manager at `/[locale]/professional/replacements`
  (server-gated). Tolerance default ±20% cal / ±20% protein / ±5g fat (overridable;
  not clinical rules). Macros entered manually (no food DB).
- **UI:** collapsed "Nutrition & role" section on each food option; group manager
  (groups → members → macros). Builder header links: `⇄ Replacement groups` + `✦ Assistant`.
- **Guardrails:** engine stays deterministic (8b); no OpenAI in classification;
  approval into plan is MVP-9; nothing patient-facing.

New files: `packages/shared/src/types/{nutrition,replacement}.ts`;
`apps/web/lib/replacements/{groups-mapping,groups-client}.ts`;
`app/api/replacement-groups/route.ts`; `app/[locale]/professional/replacements/page.tsx`;
`components/replacements/{replacement-group-manager,group-editor-card}.tsx`.
Modified: shared `meal-plan.ts`/`index.ts`; builder `types.ts`/`firestore-mapping.ts`;
`food-option-editor.tsx`; professional page header; messages (`foodRoles`,
`replacements`, option `macros`/nutrition, `builder.openReplacements`).

**Checks:** typecheck ✓ · lint ✓ · build ✓ (new `/professional/replacements` +
`/api/replacement-groups`). EN/IT parity 254=254. **Live-verified (isolated test UID,
cleaned up):** group CRUD (create→read role/tolerance/member+macros→delete→gone) +
option role/macros round-trip through `/api/plan`. Outputs in
`docs/reports/mvp-8a-replacement-data-foundation/`.

**Next: MVP-8b — deterministic replacement engine + results UI** (`POST /api/replacements`,
classification algorithm, "Find replacements" entry point). Awaiting go-ahead per the
staged plan (report after 8a before building 8b).

---

## Trajectory correction — nutritional replacement vision (ADR-013, docs-only)

A product-direction correction (no code changed):

- **MVP-7 is complete and RETAINED** as "Professional approved-plan assistant v1".
- **Correction:** approved-list lookup alone is too narrow. PlanPal's substitution
  vision is **nutritional equivalence within the context of a professional plan**
  — e.g. "what can I eat instead of 100g egg whites *without losing the plan's
  nutritional purpose*?", not just "which options were manually approved?".
- Replacements are classified: `approved` / `nutritionally_similar` /
  `needs_professional_review` / `not_suitable`. Non-approved candidates are NEVER
  presented as automatically allowed. Professional assistant may surface
  candidates for review; patient assistant (later) must be careful.
- **Next phase: MVP-8 Nutritional Replacement Engine** (spec:
  `docs/MVP_8_NUTRITIONAL_REPLACEMENT_ENGINE.md`). Recommended safest path:
  professional-defined replacement groups + optional macro fields; the LLM only
  explains/ranks — it does not invent allowed swaps.
- Roadmap: MVP-8 (engine) → MVP-9 (professional review/approval) → **MVP-10
  (patient access + patient assistant)**. The patient assistant remains a core
  PlanPal goal; professional-side work is the foundation, not the destination.
- Docs changed: ADR-013, ROADMAP, MVP_3, MVP_7 (+ its report), new MVP_8 spec,
  this memory. No build/typecheck impact (documentation only).

---

## Plan-grounded assistant (MVP-7)

First AI assistant (docs/MVP_7_PLAN_GROUNDED_ASSISTANT.md, ADR-012). **Professional-only**,
single-turn, grounded ONLY in the saved plan — no diet generation, no medical advice.

- **Route:** `POST /api/assistant` (Node) + page `/[locale]/professional/assistant`
  (server-gated, linked from the builder header). Same-origin + verified session
  cookie; `uid` from cookie only; loads the owned saved plan via Admin SDK;
  builds a **minimal `AssistantPlanContext`**; calls OpenAI server-side; returns a
  structured `AssistantAnswer`.
- **OpenAI:** official `openai` Node SDK, **Responses API**, `responses.parse` +
  `zodTextFormat` (Structured Outputs). Model via `OPENAI_MODEL` (default
  `gpt-5.4-mini` — verify current id). Key `OPENAI_API_KEY` is **server-only**
  (gitignored, in `apps/web/.env.local`).
- **Safety:** server system prompt enforces grounding + same-FoodSlot substitution
  rule; structured `safetyLevel` (ok / needs_professional_review / refused) drives
  a UI badge; deferrals → needs_professional_review; out-of-bounds → refused.
  No saved plan → `{noPlan:true}` (no OpenAI call). Guards: auth, same-origin,
  max question 1000, max_output_tokens 700, no streaming. **No rate limiter yet** (known limitation).
- **Locale:** answer in `plan.language` (fallback active UI locale). EN/IT UI parity (203=203).

New: `app/api/assistant/route.ts`, `app/[locale]/professional/assistant/page.tsx`,
`components/assistant/assistant-panel.tsx`, `lib/assistant/{context,schema,instructions,openai,client}.ts`,
`lib/professional/read-plan.ts` (extracted; `/api/plan` GET refactored to use it).
Modified: professional page (assistant link), messages (planAssistant + builder.openAssistant),
shared assistant.ts (+AssistantAnswer/AssistantSafetyLevel), env.ts (openai + isOpenAIConfigured),
.env.example. Deps added: `openai`, `zod`. Docs: ADR-012, SECURITY_BOUNDARIES, MVP_7, UI_REGISTRY v0.9.

**Checks:** typecheck ✓ · lint ✓ · build ✓. **Live verification (gpt-5.4-mini, real key, saved plan):**
approved-options → ok; unsupported substitution (ricotta) → needs_professional_review (refuses + defers);
new diet → refused; shopping list → ok; no-plan → noPlan (no OpenAI call); answers in Italian (plan.language);
guards 401/403/307. Outputs in `docs/reports/mvp-7-plan-grounded-assistant/`.

**Next flow:** MVP-8 Nutritional Replacement Engine (ADR-013). Smaller follow-ups
(assistant history persistence, rules-authoring, per-user rate limiting) are
secondary to the replacement trajectory.

---

## Cloud persistence (MVP-6)

The first cloud writes + the real server security boundary (docs/MVP_6_CLOUD_PERSISTENCE.md, ADR-011).

- **Route added:** `POST/DELETE /api/auth/session`, `GET/PUT /api/plan` (Node runtime);
  `/[locale]/professional` is now **server-gated** (`force-dynamic`, cookie verify → redirect).
- **Flow:** sign-in mints an **httpOnly session cookie** (ID token → `createSessionCookie`,
  verified with Admin SDK); `nutritionistId` = **verified-cookie UID**, never client-supplied.
  Save/load the current plan under `nutritionists/{uid}/patients/{pid}/plans/{planId}/meals/slots`.
- **Persistence:** explicit **Save** button + **load-on-mount**; localStorage stays an
  offline buffer; cloud is source of truth. `PUT` upserts the tree **and deletes
  removed meals/slots** (no zombies; removed-meal slots deleted explicitly). Server
  **validates/whitelists** every write (`firestore-mapping.ts`). One patient/plan per pro (MVP).
- **Rules:** `firestore.rules` (deny-by-default + `request.auth.uid == nutritionistId`) +
  `firebase.json`. Must be deployed. CSRF: SameSite=Lax + same-origin Origin check.
- **Secrets:** first real server secret = Admin **service account**
  (`FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY`) — server-only, gitignored, host-env in prod.

New files: `app/api/auth/session/route.ts`, `app/api/plan/route.ts`,
`lib/auth/server-session.ts`, `lib/professional/{firestore-mapping,cloud}.ts`,
`firestore.rules`, `firebase.json`. Modified: professional page (server gate),
sign-in form (mint cookie), account-menu (clear cookie), builder (save/load + save-state),
`lib/professional/{types,reducer,example-plan,storage}.ts` (patientId/planId),
`messages/{en,it}.json` (cloud namespace + auth.errors.session). Docs: ADR-011,
SECURITY_BOUNDARIES (boundary implemented), MVP_6, UI_REGISTRY v0.8, report folder.

**Checks:** typecheck ✓ · lint ✓ · build ✓ (APIs + professional dynamic, home SSG).
Outputs in `docs/reports/mvp-6-cloud-persistence/`.

**Browser E2E (2026-06-09): 18/18 PASS** — real headless Chromium (Puppeteer)
against live `planpal-11ff7`, signed in as the provisioned professional:
sign-in → save → reload-from-Firestore → remove meal → save → reload (gone) →
remove slot → save → reload (gone) → sign-out (cookie cleared) → signed-out
redirects (it/en). Stale-document deletion confirmed end-to-end. Test account
kept (left with a clean example); the credentialed E2E script was deleted, not
committed (Puppeteer installed `--no-save`). MVP-6 is verified — clear to start MVP-7.

> Security: rotate the Firebase service-account key AND the test professional's
> password before sharing this transcript externally (both appeared in it).

**Setup needed to run:** enable Firestore (Native), add a service-account key to
`apps/web/.env.local`, deploy `firestore.rules`. Until then the professional page
shows the "not configured" notice and APIs return 503. End-to-end manual test
(save→reload→load→remove→save→reload→sign-out) needs that setup.

**Known limitations:** single current plan; explicit save only (no autosave);
needs service account + deployed rules; localStorage buffer is per-browser.

**Next recommended flow: MVP-7 — Plan-grounded Assistant.** Server-side, reusing
the verified session + Admin SDK to build context from the professional's SAVED
plan. Hard requirement: answers ONLY from the saved plan, approved options, and
safe rules — no diet generation, no pretending to be the nutritionist (ADR-003).
A blueprint was drafted; awaiting confirmation of provider/model + a few choices.

---

## Professional Firebase Auth (MVP-5)

Professional sign-in is implemented (docs/MVP_5_PROFESSIONAL_AUTH.md, ADR-010).

- **Method:** Firebase Auth **email/password only**. No Google, no self-service
  sign-up (accounts are **provisioned manually in the Firebase Console** for the
  MVP pilot), no password reset, no Admin SDK, no new secrets.
- **Route added:** `/[locale]/sign-in` (public, dynamic — reads validated `?from`).
  `/[locale]/professional` is now **protected** (redirects to sign-in when signed out).
- **Auth state:** `AuthProvider` (client, `onAuthStateChanged`) wraps the app
  inside `NextIntlClientProvider`; exposes `{ user, loading, configured }` +
  `useAuth()` / `useNutritionistId()`.
- **Protection:** `RequireAuth` is a **client-side UX gate, NOT a server security
  boundary** (acceptable now — no private server data, builder is localStorage-only).
  Real boundary (session cookie + Admin verification + Firestore rules) is required
  before any cloud persistence. See docs/SECURITY_BOUNDARIES.md.
- **Ownership:** Firebase Auth **UID = nutritionistId**; the builder stamps
  `user.uid` into `BuilderState.nutritionistId` (replacing the placeholder).
- **Env:** the existing `NEXT_PUBLIC_FIREBASE_*` (6 vars) only. No bypass flag —
  missing config shows a localised "Firebase not configured" notice.
- **Redirect safety:** `from` is validated to internal, locale-stripped,
  allow-listed paths (`lib/auth/redirect.ts`) — no open redirects.

New files: `components/auth/{auth-provider,require-auth,account-menu}.tsx`,
`app/[locale]/sign-in/{page,sign-in-form}.tsx`, `lib/auth/{redirect,auth-errors}.ts`.
Modified: `app/[locale]/layout.tsx` (AuthProvider), `app/[locale]/professional/page.tsx`
(RequireAuth), `components/app-shell.tsx` (AccountMenu), `components/professional/
{professional-plan-builder (stamp uid), fields (email/password type)}.tsx`,
`lib/professional/{types,example-plan,reducer,storage}.ts` (nutritionistId),
`messages/{en,it}.json` (auth namespace). Docs: ADR-010, SECURITY_BOUNDARIES auth
section, MVP_5, UI_REGISTRY v0.7.

**Checks:** typecheck ✓ · lint ✓ · build ✓ (`/[locale]/sign-in` dynamic, professional
still SSG). EN/IT key parity 179=179. Verified the unconfigured-Firebase notice
renders localised on both locales (no `.env.local` in this env).

**Known limitations:** client-side gate only (UX, not security) until the
persistence flow; accounts created manually; local dev needs real Firebase config
(no emulator wired yet); the actual sign-in form/redirect/sign-out require a
configured project to exercise.

**Next recommended flow:** cloud persistence — session cookie + Firebase Admin
verification + Firestore rules + map builder draft to `nutritionists/{uid}/...`
(MVP_2). Needs its own architect blueprint.

---

## First product flow (MVP-4) — professional plan builder + client preview

The first real product loop is implemented (docs/MVP_4_FIRST_PRODUCT_FLOW.md):
a professional creates a client → structures a plan → adds meals → food slots →
approved options, with a **live client "today's plan" preview** beside the builder.

- **Route:** `/[locale]/professional` (`/en/professional`, `/it/professional`),
  linked from the home "Plan editor" teaser. Statically generated per locale.
- **Persistence:** local `useReducer` state + `localStorage` only — **no auth /
  Firestore yet** (ADR-009). Draft shapes mirror the Firestore schema field-for-field.
- **Localisation:** fully en/it. New namespaces `builder`, `mealNames`,
  `foodCategories`, `foodUnits`. Example plan *data* is locale-keyed in
  `lib/professional/example-plan.ts` (a plan is authored in one language).
- **Shared types:** reused; `Patient` gained optional `note?`. Builder UI-state
  draft types live in `apps/web/lib/professional/`, not in shared.
- **Verified:** typecheck/lint/build clean; `/en/professional` + `/it/professional`
  prerender; preview updates from entered data; zero English leak on the IT builder;
  EN/IT message-key parity (161 = 161, no orphans).

### Review pass + fixes (after first build)

- **Status-consistency fix:** the preview badge is now status-aware — draft →
  "Draft/Bozza" + warning; draft + "Preview as active" toggle → "Preview/Anteprima",
  no warning; active → "Active/Attivo", no warning. Removed the contradictory
  "Active plan" badge + draft-warning combo; reworded the success banner to a
  status-neutral "this plan is complete". (UI_REGISTRY v0.6 documents the rule.)
- **Builder is client-rendered after restore:** the interactive builder renders a
  skeleton on the server and mounts on the client once the localStorage draft is
  restored. This makes edits survive locale switches (the page remounts per locale)
  and avoids hydration mismatches on the form — including ones caused by
  form-filler browser extensions (e.g. an injected `data-sharkid` attribute).

**Known limitations:** drafts are per-browser (localStorage), not synced/backed up;
no auth/Firestore; single client/plan at a time; "Preview as active" is an
ephemeral preview toggle (does not change stored status). A brief skeleton shows
before the builder hydrates.

**Checks run:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓
(saved under `docs/reports/mvp-4-first-product-flow/`).

Key new files: `app/[locale]/professional/page.tsx`; `lib/professional/{types,reducer,
example-plan,storage,enums}.ts`; `components/professional/{professional-plan-builder,
client-details-card,plan-details-card,meal-builder,meal-editor-card,food-slot-editor,
food-option-editor,client-plan-preview,fields,section-card}.tsx`. Extended:
`AppShell` (`nav="minimal"`), `ActionPill` (`localeHref`, `onClick`), home teaser.
Docs: new `docs/MVP_4_FIRST_PRODUCT_FLOW.md`, ADR-009, UI_REGISTRY v0.5.

Next recommended flow: add Firebase Auth for the professional, then map builder
state → Firestore under `nutritionists/{uid}/...` (resolve auth ownership first).

---

## What was built (scaffold)

The first real PlanPal application was scaffolded: an npm monorepo with a
Next.js web app, a shared types package, Firebase placeholder structure, and the
first UI shell (a landing/dashboard hybrid). This realises ADR-005 and pins
tooling in ADR-007.

The app is **bilingual (en/it) from the foundation** (ADR-008), using `next-intl`
with locale-prefixed routing. **Localisation is a scaffold requirement, not a
later feature** — no user-facing strings are hardcoded in components.

Before this session the repo was documentation-only (no `package.json`, no app).

## Versions used

```txt
Next.js        16.2.7  (App Router + Turbopack)
React          19.2
Tailwind CSS   4.3     (CSS-first config, no tailwind.config.ts)
next-intl      4.13    (i18n: en/it, default it)
Firebase       12.14
firebase-admin 13.10
TypeScript     5.9
Node           24 (engines: >=20.9)
```

See ADR-007 for why these differ from the "Next.js 15" wording in older docs.

## Files created

Root:

- `package.json` — npm workspaces (`apps/*`, `packages/*`) + dev/build/lint/typecheck scripts.
- `.gitignore` — ignores node_modules, `.next`, `.env*`, service-account JSON, etc.
- `package-lock.json` — generated by `npm install`.

`packages/shared` (pure domain types, no runtime imports):

- `package.json` (`@planpal/shared`, points main/types to `src/index.ts`), `tsconfig.json`.
- `src/index.ts` — re-exports all types.
- `src/types/nutritionist.ts` — `Nutritionist`, `NutritionistRule`, `RuleScope`.
- `src/types/patient.ts` — `Patient`, `PatientQuestion`, `QuestionCategory`.
- `src/types/meal-plan.ts` — `MealPlan`, `Meal`, `FoodSlot`, `FoodOption`, status/unit/category unions (`PlanLanguage` aliased to `SupportedLocale`).
- `src/types/assistant.ts` — `AssistantPlanContext`, `AskAssistantRequest`, `AskAssistantResponse`.
- `src/types/locale.ts` — `SupportedLocale`, `SUPPORTED_LOCALES`, `DEFAULT_LOCALE` (= `it`).

`apps/web`:

- `package.json` (`@planpal/web`), `next.config.ts` (next-intl plugin + transpilePackages `@planpal/shared`),
  `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` (flat), `.env.example`.
- `app/globals.css` (Tailwind v4 `@theme` tokens), `app/manifest.ts` (PWA manifest).
- `app/[locale]/layout.tsx` (html lang, NextIntlClientProvider, generateStaticParams,
  setRequestLocale, localised metadata), `app/[locale]/page.tsx` (dashboard, localised).
- i18n: `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`, `proxy.ts`
  (locale negotiation — Next 16 `proxy` convention), `messages/en.json`, `messages/it.json`.
- `components/app-shell.tsx`, `hero-card.tsx`, `plan-card.tsx`, `meal-card.tsx`,
  `action-pill.tsx`, `language-switcher.tsx` (EN | IT, client).
- `lib/env.ts` (client/server env split), `lib/firebase/client.ts`, `lib/firebase/server.ts`
  (`server-only`, lazy admin init), `lib/mock-data.ts` (keys only, typed with `@planpal/shared`).

Note: the original root `app/layout.tsx` + `app/page.tsx` were moved under
`app/[locale]/` when locale routing was added.

## Review + responsive pass (after first scaffold)

A review pass audited plan alignment, localisation, UI consistency, responsive
behaviour, Firebase/env safety and scope. Findings were addressed in place:

- **Mobile header overflow (fixed):** on narrow phones (~360–375px) the top row
  (logo + switcher + CTA ≈ 364px) overflowed. The language switcher now lives in
  the mobile nav row; the top row is logo + CTA only. Desktop unchanged.
- **Sticky-header anchor overlap (fixed):** added `scroll-padding-top: 7rem` so
  `#today/#plan/#assistant/#shopping` jumps clear the sticky header. `#shopping`
  id moved onto the shopping card (was on a bottom link).
- **Localisation gaps (fixed):** nav landmark `aria-label`s were hardcoded
  English → now `nav.ariaPrimary`. Full hardcoded-English scan is clean (only the
  "PlanPal" brand wordmark remains literal).
- **Copy (softened):** IT plan title "Piano Equilibrio di Primavera" →
  "Piano alimentare primavera" (more natural).
- **Scope:** professional area is preview-only (badge "Anteprima dashboard"); the
  real dashboard/plan editor were intentionally NOT built.

Verified on the **iOS Simulator (iPhone 17, 393pt)** via Safari at
`localhost:3000` — layout, switcher and sticky nav confirmed on device.

## Files updated

- `docs/DECISIONS.md` — **ADR-007** (current stable tooling) + **ADR-008** (localise from the start).
- `docs/UI_REGISTRY.md` — v0.4: merged the remote reference/design-intent baseline with the implemented patterns layer (tokens, real classes, responsive mobile-header, `scroll-padding-top`, LanguageSwitcher).

> Note: a rebase onto remote `main` (which had added a visual-direction **ADR-006**)
> renumbered the scaffold ADRs — **tooling = ADR-007**, **localisation = ADR-008**.
> All cross-references were updated to match.
- `docs/CODING_STANDARDS.md` — added a **Localisation** section (locales, no hardcoded strings, conventions).
- `docs/MVP_0_PRODUCT_SPEC.md` — added **Audience and Languages** (bilingual en/it, it default).
- `docs/MVP_3_AI_ASSISTANT_SPEC.md` — strengthened **Language Behaviour** (active locale, reply in app locale).
- `memory.md` — this handoff.

## Current state

Foundation scaffold complete and verified. Quality gates all pass:

```txt
npm install       ok
npm run typecheck ok (shared + web, clean)
npm run lint      ok (clean)
npm run build     ok (/it and /en prerendered as SSG, / via proxy redirect)
```

Custom Tailwind token utilities confirmed in built CSS. Locale routing verified
at runtime: `/` → 307 → `/it`; `/it` renders Italian (`lang="it"`), `/en` renders
English (`lang="en"`); no English copy leaks onto the Italian page.

## How to run the app

```bash
npm install            # from repo root, once
npm run dev            # starts apps/web at http://localhost:3000
npm run build          # production build
npm run lint           # eslint
npm run typecheck      # tsc --noEmit across shared + web
```

Locale URLs: `/` redirects to `/it` (default); visit `/it` or `/en` directly, or
use the EN | IT switcher in the header.

To use Firebase, copy `apps/web/.env.example` to `apps/web/.env.local` and fill
in real values (never commit `.env.local`).

## Known limitations (intentional for this pass)

- No real auth, no Firestore reads/writes — dashboard uses `lib/mock-data.ts`.
- No `/api/assistant/ask` route yet; the "Ask" input is a disabled preview.
- Firebase client/server are placeholder helpers (lazy, throw if unconfigured).
- PWA is "ready" via manifest + theme color only — **no service worker, no icon
  assets** yet.
- Localisation covers en/it UI copy + switcher, but: no persisted language
  preference (switch is per-navigation), no locale-aware `<alternate>`/hreflang
  SEO tags yet, and only two locales.
- No billing, clinic hierarchy, barcode/wearables, native app (all out of scope).

## Housekeeping note

Legacy duplicate skill folders were **removed** (`git rm`) in a dedicated
housekeeping pass:

```txt
.agent/imprint/   .agent/remember/   .agent/review/   (deleted)
```

`.agent/skills/<name>/SKILL.md` is now the **only** canonical skill location.
The deleted folders held older, more verbose editions of those three skills; the
condensed versions under `.agent/skills/` are authoritative. Final `.agent/`
tree: `README.md`, `AGENT_OPERATING_SYSTEM.md`, `skills/` (architect, decide,
execute, imprint, orient, recover, remember, review), `templates/` (memory,
decision-record, review-report). No other legacy direct skill folders existed.

## Next recommended task

Run `review` on this scaffold, then architect the **professional auth shell**
(Firebase Auth login + a protected `/dashboard` route), since the data model and
security boundaries are professional-first. Do not start it without a new
architect blueprint.
