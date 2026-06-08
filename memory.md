# Memory — PlanPal App Scaffold

Last updated: 2026-06-08

## Latest: Professional Firebase Auth (MVP-5)

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
