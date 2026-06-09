# PlanPal Decisions

This file records durable project decisions.

Use it when a choice affects future product, architecture, data, UI, deployment, tooling, or agent workflow.

Do not record every tiny implementation detail. Record decisions that a future agent or developer would otherwise reopen or misunderstand.

---

## ADR-001: GitHub is the source of truth

Date: 2026-06-08
Status: Accepted

### Context

The project started in conversation, but a serious MVP needs stable project memory outside chat.

### Decision

GitHub is the source of truth for PlanPal.

Conversation is used for thinking and collaboration. Durable project knowledge must be saved in the repository.

### Reasoning

Chat history is not reliable enough for multi-session development. Repository files can be read by future agents, reviewed, changed, versioned and restored.

### Consequences

Positive:

- Future sessions can restore context from the repo.
- Decisions and specifications can be reviewed like normal project assets.
- The project is not dependent on a single conversation.

Negative / trade-offs:

- Important thinking must be saved deliberately.
- More discipline is required at the end of each session.

### Implications for future work

- Save durable knowledge in `docs/`.
- Save current handoff state in `memory.md`.
- Save reusable agent behaviour in `.agent/`.

---

## ADR-002: Build as a PWA before native mobile

Date: 2026-06-08
Status: Accepted

### Context

PlanPal may eventually benefit from a native mobile app, but the first goal is to validate the professional and client workflow quickly.

### Decision

The MVP should start as a Next.js PWA rather than a Flutter or native mobile app.

### Reasoning

A PWA is faster to build, easier to deploy, easier to combine with a professional dashboard, and good enough to test the core workflow on mobile devices.

### Consequences

Positive:

- Faster MVP delivery.
- Shared codebase for dashboard and client experience.
- Easier deployment through Vercel.

Negative / trade-offs:

- Native app features are deferred.
- App store distribution is not part of the MVP.

### Implications for future work

- Do not add Flutter or native mobile structure during the MVP.
- Reconsider native apps only after the workflow is validated.

---

## ADR-003: The assistant supports professional plans, it does not create diets

Date: 2026-06-08
Status: Accepted

### Context

The core product idea is to help clients follow an existing professional plan in real life.

### Decision

PlanPal should not position the MVP as a diet generator.

The assistant should answer from the active plan and professional-approved information.

### Reasoning

This keeps the product clearer, safer, and more differentiated from generic AI diet tools.

### Consequences

Positive:

- Stronger product positioning.
- Safer assistant behaviour.
- Clearer value for professionals.

Negative / trade-offs:

- The assistant must be constrained.
- Some user questions may need to be redirected back to the professional.

### Implications for future work

- Do not build automatic plan generation into the MVP.
- Assistant prompts must emphasise plan support rather than plan creation.
- Data model should favour approved options and structured plan context.

---

## ADR-004: Store approved food options inside food slots for MVP

Date: 2026-06-08
Status: Accepted

### Context

The MVP needs simple substitutions and easy assistant context construction.

### Decision

For MVP 0.1, food options should be embedded inside the `FoodSlot` document.

### Reasoning

Options are small, always read with their slot, and substitution logic depends on comparing options within the same slot.

### Consequences

Positive:

- Simpler Firestore reads.
- Easier assistant context building.
- Easier substitution logic.

Negative / trade-offs:

- Options are not reusable across plans at first.
- If options become large or shared, the model may need to evolve.

### Implications for future work

- Keep MVP substitution logic slot-based.
- Do not introduce a broad food option database until there is a real need.

---

## ADR-005: Scaffold as npm monorepo with Tailwind, Firebase and UI from the start

Date: 2026-06-08
Status: Accepted

### Context

Before scaffolding the actual application, the open implementation decisions were repository layout, package manager, styling approach, Firebase timing and whether to establish UI immediately.

### Decision

PlanPal should be scaffolded as a monorepo using npm workspaces.

The first app should live under:

```txt
apps/web
```

Shared code should live under:

```txt
packages/shared
```

The app should use Tailwind from the start.

Firebase should be configured from the start.

The first UI shell and visual baseline should be created immediately rather than postponed.

### Reasoning

A monorepo gives the project room to grow without needing a later restructuring. npm keeps tooling familiar and avoids adding package-manager complexity. Tailwind from the start prevents early UI from drifting. Firebase from the start forces auth and data assumptions to be designed honestly rather than bolted on later. Creating the first UI baseline immediately lets `docs/UI_REGISTRY.md` become useful early.

### Consequences

Positive:

- Clear structure for web app and shared types.
- Early alignment between data model, Firebase and UI.
- UI consistency can be established from the first screens.
- Future packages can be added without restructuring the repository.

Negative / trade-offs:

- Initial scaffold is slightly more complex than a single-app setup.
- Firebase configuration must be handled carefully to avoid exposing secrets.
- Tailwind and UI baseline decisions must be kept consistent through imprint mode.

### Implications for future work

- Scaffold root `package.json` with npm workspaces.
- Create `apps/web` as the Next.js TypeScript PWA.
- Create `packages/shared` for shared domain types.
- Install and configure Tailwind during the initial scaffold.
- Add Firebase client/server structure during the initial scaffold.
- Establish the first UI baseline and update `docs/UI_REGISTRY.md` after UI shell creation.

---

## ADR-006: Use soft clinical SaaS visual direction for the first UI baseline

Date: 2026-06-08
Status: Accepted

### Context

Two UI reference screenshots were added under `ui-reference/` and shared for visual analysis. They show a modern healthcare SaaS style with soft cards, bright blue accents, rounded surfaces, spacious mobile layouts and clean dashboard composition.

### Decision

PlanPal should use a soft clinical SaaS visual direction for the first UI shell.

The design should borrow the visual language from the references, not the medical content.

### Reasoning

The references fit PlanPal's product positioning: calm, professional, friendly and trustworthy. This avoids the cluttered, gamified feel common in diet apps while still feeling approachable on mobile.

### Consequences

Positive:

- Clear visual direction before scaffolding UI.
- Strong fit for professional dashboard and client PWA.
- Good foundation for a polished MVP.

Negative / trade-offs:

- The app must avoid looking like a hospital or emergency medical app.
- UI should not copy doctor/scan/appointment content directly.

### Implications for future work

- Use `docs/UI_REGISTRY.md` as the baseline for Tailwind styling.
- Use light backgrounds, rounded white cards, blue accents and pill navigation.
- Translate reference concepts into PlanPal concepts such as clients, meal plans, meals, food slots, questions and shopping lists.
- Run imprint after the first UI shell is built.

---

## ADR-007: Scaffold on current stable tooling (Next.js 16, Tailwind v4), not the originally documented versions

Date: 2026-06-08
Status: Accepted

### Context

Earlier docs (README, CODING_STANDARDS) named "Next.js 15" and the scaffold
target structure implied Tailwind v3 conventions (`tailwind.config.ts`,
`next lint`). The scaffold task explicitly instructed using the best current
stable tooling and recording any materially different choice here.

At scaffold time the current stable versions were:

```txt
Next.js        16.2.7  (App Router + Turbopack)
React          19.2
Tailwind CSS   4.3     (CSS-first config)
Firebase       12.14
firebase-admin 13.10
Node           24 (engines: >=20.9)
```

### Decision

Scaffold PlanPal on the current stable tooling above, adopting the newer
conventions these versions recommend:

- **Tailwind CSS v4 CSS-first config.** Design tokens live in
  `apps/web/app/globals.css` under `@theme`; PostCSS uses
  `@tailwindcss/postcss`. There is **no `tailwind.config.ts`**.
- **ESLint flat config.** Next.js 16 removed the built-in `next lint` command.
  Linting uses `eslint .` with `eslint.config.mjs` consuming the native flat
  config exported by `eslint-config-next@16`.
- **Workspace types via `transpilePackages`.** `apps/web` imports
  `@planpal/shared` TypeScript source directly; `next.config.ts` lists it under
  `transpilePackages`.

This supersedes the "Next.js 15" / Tailwind-v3 wording in README and
CODING_STANDARDS. ADR-002 (PWA-first) and ADR-005 (npm monorepo + Tailwind +
Firebase + UI from the start) remain unchanged — this ADR only pins versions
and the config conventions they imply. ADR-006 (visual direction) is independent.

### Reasoning

The task prioritised current stable tooling over the literal versions named in
prose. Tailwind v4 and Next 16 are stable and change file conventions; adopting
them now avoids an immediate migration and keeps the scaffold idiomatic.

### Consequences

Positive:

- Idiomatic, current scaffold; no day-one upgrade debt.
- Faster builds (Turbopack) and simpler styling config (CSS-first tokens).

Negative / trade-offs:

- Contributors expecting `tailwind.config.ts` or `next lint` must learn the v4 /
  flat-config conventions.
- Prose docs that still say "Next.js 15" are now historical; this ADR is the
  authority on versions.

### Implications for future work

- Treat `globals.css` `@theme` as the source of design tokens (see UI_REGISTRY).
- Use `eslint.config.mjs` (flat) for lint rule changes.
- A service worker and real PWA icon assets are still TODO — the scaffold is
  "PWA-ready" via `app/manifest.ts` + viewport theme color only.

---

## ADR-008: Localise the app from the start

Date: 2026-06-08
Status: Accepted

### Context

PlanPal will target both English-speaking and Italian-speaking users. The app must be suitable for an Italian audience as well as an English one.

### Decision

PlanPal must support localisation from the first scaffold.

The initial supported locales are:

- `en`
- `it`

User-facing UI strings must not be hardcoded directly in components. They should come from locale message files or the chosen i18n system.

### Reasoning

Localisation affects routing, copy, assistant behaviour, onboarding, nutrition-plan language, SEO and future product positioning. Adding it later would require unnecessary refactoring.

### Consequences

Positive:

- The app is ready for both English and Italian audiences from the beginning.
- UI copy stays organised.
- Future onboarding and assistant behaviour can respect language choice.
- Italian market support is treated as a core product requirement, not an afterthought.

Negative / trade-offs:

- Initial scaffold is slightly more complex.
- Every UI component must be careful not to hardcode user-facing strings.

### Implications for future work

- Add an i18n/localisation setup during the first app scaffold.
- Create English and Italian message files.
- Use locale-aware routes or the current recommended Next.js localisation approach.
- Include a language switcher in the first UI shell.
- Store or infer the active locale cleanly.
- Assistant API design should pass the active locale or plan language where relevant.

### Implementation notes (recorded after scaffolding)

- **Library:** `next-intl@4.13` — App Router compatible, TypeScript-first,
  works with npm workspaces and static rendering. Chosen as the current best
  stable Next.js i18n approach; no materially different library was warranted.
- **Default locale:** `it`, **fallback:** `en` (Italian is a core target).
- **Routing:** locale-prefixed (`/it`, `/en`); `localePrefix: "always"`, so `/`
  redirects to `/it`. Locale negotiation runs in `apps/web/proxy.ts` (Next 16
  renamed the `middleware` convention to `proxy`, see ADR-007).
- **Source of truth for locales:** `SUPPORTED_LOCALES` / `DEFAULT_LOCALE` /
  `SupportedLocale` in `@planpal/shared`; `i18n/routing.ts` reads from there, and
  `PlanLanguage` is aliased to `SupportedLocale` so plan/app/assistant languages
  cannot drift apart.
- **Messages:** `apps/web/messages/{en,it}.json`. Components resolve text via
  `useTranslations` / `getTranslations`; mock data carries only keys, never copy.
- **Switcher:** `components/language-switcher.tsx` (EN | IT pills), preserves the
  current path via the locale-aware router. No persisted preference yet (MVP).

---

## ADR-009: First product flow uses local state + localStorage, not Firestore

Date: 2026-06-08
Status: Accepted

### Context

The first real product flow (the professional plan builder + client preview,
docs/MVP_4_FIRST_PRODUCT_FLOW.md) needs somewhere to keep the plan being built.
Firebase Auth is not wired up — the Firebase helpers are lazy placeholders that
throw when unconfigured, and there is no authenticated `nutritionistId` to own
writes. docs/SECURITY_BOUNDARIES.md requires writes to live under
`nutritionists/{nutritionistId}` with clear ownership, and the scaffold brief
said not to improvise unsafe Firestore writes.

### Decision

Implement the first product flow with **local React state (`useReducer`) plus
`localStorage`**. No Firestore reads or writes happen in this flow.

The builder's working types (`apps/web/lib/professional/types.ts`) mirror the
shared domain (MealPlan → Meal → FoodSlot → FoodOption) field-for-field, using
the shared enums, so the state maps directly onto the Firestore schema later.

### Reasoning

This ships a usable, typed, fully interactive core loop now without depending on
auth, and without creating an ownership/security gap. Keeping the shape
schema-compatible means cloud persistence becomes a mapping step, not a rewrite.

### Consequences

Positive:

- Real product value (build a plan, see the client preview) with zero auth risk.
- Drafts survive refreshes (localStorage), so the flow feels like a product.
- A clean, documented path to Firestore persistence.

Negative / trade-offs:

- Drafts are per-browser and not shared or backed up.
- A later flow must add auth + the local-state → Firestore mapping.

### Implications for future work

- The next flow adds Firebase Auth for the professional, then maps builder state
  to `nutritionists/{uid}/patients/.../plans/...` per docs/MVP_2 — only after
  auth ownership is resolved.
- Do not add Firestore writes to the builder until auth ownership exists.
- Keep builder draft types aligned with `@planpal/shared` so the mapping stays
  trivial. Builder UI-state types belong in the app, not in the shared package.

---

## ADR-010: Professional auth — email/password, client-side gate, UID = nutritionistId

Date: 2026-06-08
Status: Accepted

### Context

The professional area (`/[locale]/professional`) was freely accessible. We need
authentication so the app knows the professional and can later own their data,
but no cloud persistence exists yet (ADR-009) and there is no private
server-rendered data.

### Decision

- **Method:** Firebase Auth **email/password only**. No Google/OAuth. No
  self-service sign-up — professional accounts are **provisioned manually in the
  Firebase Console** for the MVP pilot.
- **Auth state:** Firebase JS SDK (default local/IndexedDB persistence), surfaced
  through a client `AuthProvider` (`onAuthStateChanged`) exposing
  `{ user, loading, configured }`.
- **Protection:** **client-side gate** (`RequireAuth`) redirecting signed-out
  users to `/[locale]/sign-in`. This is a **UX gate, not a server security
  boundary** — acceptable now because nothing private is served or written
  server-side (builder is localStorage-only). Real enforcement (session cookie +
  Firebase Admin verification + Firestore rules) is a prerequisite of the
  persistence flow, documented in `docs/SECURITY_BOUNDARIES.md`.
- **Ownership:** the Firebase Auth **UID is the canonical `nutritionistId`**. The
  builder stamps `user.uid` into the local draft (`BuilderState.nutritionistId`),
  replacing the prior placeholder, so the draft shape already matches the future
  `nutritionists/{uid}` Firestore root.
- **No Admin SDK, no service account, no new secrets** this pass (client config
  uses the public `NEXT_PUBLIC_FIREBASE_*` values only).
- **No auth-disabled bypass flag** — even a harmless one risks becoming dangerous
  once Firestore lands. Local dev requires real Firebase client config; if it is
  missing, the UI shows a localised "Firebase not configured" notice.
- **`from` redirect** after sign-in is validated to internal, locale-stripped,
  allow-listed paths only (`sanitizeInternalPath`) to prevent open redirects.

### Reasoning

Email/password is the simplest method to validate one nutritionist. A client gate
ships protection now without the Admin SDK/cookies, matching "no cloud writes
yet". UID = nutritionistId keeps ownership unambiguous and future-proof.

### Consequences

Positive: usable protected professional shell; UID available for persistence;
zero new secrets; clear upgrade path. Negative: protection is client-only until
the persistence flow; accounts are created manually; local dev needs real config.

### Implications for future work

- The Firestore flow MUST add: a session cookie minted from the ID token, server
  verification via Firebase Admin (in `proxy.ts` or route handlers), and
  Firestore rules `request.auth.uid == nutritionistId` under `nutritionists/{uid}`.
- Self-service sign-up, Google auth, and password reset remain deferred, separate
  decisions.

---

## ADR-011: Cloud persistence — server route handlers + session cookie + Admin SDK + Firestore rules

Date: 2026-06-08
Status: Accepted

### Context

The plan builder was localStorage-only (ADR-009) and the professional area was
protected by a client-side UX gate only (ADR-010). MVP-6 introduces the first
cloud writes, which require a real server security boundary.

### Decision

- **Access path:** all reads/writes go through **Next.js Route Handlers (Node
  runtime) using the Firebase Admin SDK**, never direct client-SDK writes.
  `GET/PUT /api/plan`, `POST/DELETE /api/auth/session`.
- **Session:** on sign-in the client exchanges its Firebase **ID token** for an
  **httpOnly, SameSite=Lax session cookie** (`createSessionCookie`); Secure only
  in production. Verified server-side with `verifySessionCookie`. Sign-out clears
  it. This is the real boundary (ADR-010's client gate stays for UX only).
- **Ownership:** the `nutritionistId` is the **UID from the verified cookie**,
  never a client-supplied value. Writes go to
  `nutritionists/{uid}/patients/{patientId}/plans/{planId}/meals/{mealId}/slots/{slotId}`
  (MVP_2; options embedded per ADR-004).
- **Firestore Security Rules** (`firestore.rules`) deny-by-default and allow only
  `request.auth.uid == nutritionistId` — defence-in-depth (Admin bypasses rules;
  these lock out any direct/accidental client-SDK access).
- **Save model:** explicit **Save** button + **load-on-mount** (no autosave).
  localStorage remains an offline buffer; the cloud is the source of truth.
- **Whole-tree upsert with deletion:** PUT reads the existing meals/slots and, in
  one batch, upserts submitted docs and **deletes meals/slots no longer present**
  (Firestore does not cascade — removed-meal slots are deleted explicitly). No
  zombie documents.
- **Validation:** the server whitelists/validates the incoming draft
  (`validateBuilderState`) before writing — known fields only, enum values
  checked — so arbitrary client JSON is never persisted.
- **Scope:** one current patient + plan per professional. Multi-client/multi-plan
  deferred.
- **CSRF:** SameSite=Lax + a same-origin `Origin` check on mutation routes (no
  explicit CSRF token this pass).
- **Secrets:** introduces the first real server secret — the Admin
  **service-account** (`FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY`),
  server-only, gitignored, host-env in production.

### Consequences

Positive: real ownership boundary; durable plans; clean path to the assistant
route (which reuses the verified session). Negative: requires a service-account
key; two auth representations (client session + server cookie) kept in sync on
sign-in/out; whole-tree upsert re-reads the (small) tree per save.

### Implications for future work

- The assistant route and any future server data access reuse
  `getCurrentNutritionistId()` + Admin SDK.
- `firestore.rules` must be deployed (Console or `firebase deploy --only
  firestore:rules`).
- Multi-plan, debounced autosave, and real-time sync are later, separate flows.
