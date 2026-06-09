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

---

## ADR-012: Plan-grounded assistant — OpenAI Responses API, server-side, structured, professional-only

Date: 2026-06-09
Status: Accepted

### Context

MVP-7 adds the first AI assistant. PlanPal must remain the source of truth: the
assistant answers only from the professional's saved Firestore plan and approved
options — no diet generation, no medical advice, no overriding the professional
(ADR-003). It builds on the MVP-6 verified-session + Admin-SDK boundary.

### Decision

- **Provider:** OpenAI **Responses API** via the official `openai` Node SDK,
  **server-side only**. Not a ChatGPT custom GPT.
- **Model:** configurable via `OPENAI_MODEL`; default the current recommended
  low-cost structured-output model (**`gpt-5.4-mini`** at implementation time —
  verify against OpenAI's available models). If a configured model is
  unavailable, the call fails and the UI shows a friendly localised error.
- **Structured output:** a `zod` schema (`AssistantAnswer`) enforced via Structured
  Outputs (`responses.parse` + `zodTextFormat`). The server validates it and
  **forces `groundedIn.planId`** to the actually-loaded plan. Raw model text is
  never returned.
- **Route:** `POST /api/assistant` (Node runtime): same-origin check → verify
  session cookie → `uid` from cookie only (never the body) → load the owned saved
  plan via Admin SDK → build a **minimal `AssistantPlanContext`** → call OpenAI →
  return `AssistantAnswer`. No saved plan → `{ noPlan: true }`, no OpenAI call.
- **Audience:** professional-only, single-turn ask → answer. No streaming, no
  history persistence (deferred).
- **UI:** dedicated `/[locale]/professional/assistant`, linked from the builder.
  A plan-helper card (not a generic chatbot) with a safety badge.
- **Locale:** answer in `plan.language` (plans are authored in one language);
  active UI locale is the fallback.
- **Safety:** system instruction (server-only) enforces grounding + the
  same-slot substitution rule; a structured `safetyLevel`
  (`ok` / `needs_professional_review` / `refused`) drives the badge; deferrals
  set `needs_professional_review`.
- **Guards (no full rate limiter yet):** auth required, same-origin, max question
  length (1000), `max_output_tokens` (700), no anonymous access, no streaming.

### Consequences

Positive: grounded, safe, localised assistant; reuses the verified session;
structured output is reliable and validated server-side. Negative: a new server
secret (`OPENAI_API_KEY`); each ask costs an OpenAI call; per-user rate limiting
is still required before broader pilot use (known limitation).

### Implications for future work

- Per-user rate limiting before wider pilot.
- Assistant history persistence (`nutritionists/{uid}/patients/{pid}/questions`)
  as a separate flow.
- Client-facing assistant only after client login exists.

---

## ADR-013: Replacement intelligence is based on nutritional equivalence, not approved-list lookup only

Date: 2026-06-09
Status: Accepted

### Context

MVP-7 shipped a professional assistant that answers from **approved options
only**. That is the safest answer, but it is **not the whole product vision**.
The core patient problem is broader:

> "I have 100g of egg whites in my plan. Given my plan, what can I eat instead?"

The right answer must consider the original food's nutritional role, quantity,
macros (where available), meal context, food slot/category, and professional
constraints — not just foods already manually listed as approved options.

### Decision

- Approved options remain the **safest** answer and are preferred when available.
- But PlanPal must support **candidate replacements based on nutritional
  similarity**, not approved-list lookup alone.
- **Non-approved replacements must never be presented as automatically allowed.**
- Every replacement is classified:

  | Classification | Meaning |
  | --- | --- |
  | `approved` | Explicitly approved in the plan or by the professional. |
  | `nutritionally_similar` | Appears to match the original food's nutritional role, but **requires professional review** unless already approved. |
  | `needs_professional_review` | Plausible but uncertain / insufficient data — defer to the professional. |
  | `not_suitable` | Too different, conflicts with the slot/plan, or lacks enough data. |

- **Professional-facing** wording may surface candidates *for review*
  ("not currently approved, but a possible candidate — review before showing the
  patient as allowed").
- **Patient-facing** wording must be careful and never imply approval
  ("this looks similar, but it isn't approved in your plan yet — ask your
  professional to approve it").
- We do **not** rely purely on the LLM to invent replacements. Accuracy comes
  from professional-defined equivalence groups and/or stored macro data first
  (see docs/MVP_8_NUTRITIONAL_REPLACEMENT_ENGINE.md).

### Consequences

Positive: PlanPal addresses the real substitution problem, not just list lookup;
safety is preserved via explicit classification + review. Negative: needs a data
source for nutrition/equivalence (macros on plan items, a trusted food DB, or
professional-defined groups); more product surface (review/approval flow, MVP-9).

### Implications for future work

- MVP-8 builds the replacement engine (candidates + classification), MVP-9 the
  professional review/approval, MVP-10 patient access + patient assistant.
- `FoodOption` will likely gain optional `nutrition?`, `role?`, and
  `replacementGroupId?` fields later — documented, not implemented yet.
- The MVP-7 assistant stays "approved options only" until MVP-8/9 land; its docs
  are annotated as "safe but incomplete".

---

## ADR-014: MVP-8a replacement data foundation — additive option fields + owned replacement-group collection

Date: 2026-06-09
Status: Accepted

### Context

MVP-8 (ADR-013) is delivered in two internal passes. **MVP-8a** is the data
foundation; **MVP-8b** is the deterministic engine + results UI. 8a must give the
engine something real to reason over without building the engine yet.

### Decision

- **`FoodOption` gains optional, additive, backward-compatible fields:**
  `nutrition?: NutritionalProfile`, `role?: FoodRole`, `replacementGroupId?: string`.
  Existing plans without them keep working; values are never invented.
- **`FoodRole` is separate from `FoodCategory`** — category describes the slot;
  role is the nutritional role used by the engine. A `categoryToDefaultRole`
  helper maps where useful, but the concepts stay distinct.
- **Replacement groups are a first-class owned collection:**
  `nutritionists/{uid}/replacementGroups/{groupId}` (name, role, tolerance,
  members[] with optional macros). They supply off-plan candidates (e.g. ricotta,
  turkey) the engine can suggest — not possible from in-plan foods alone.
- **Tolerance** has a global default (±20% calories, ±20% protein, ±5g fat),
  overridable per group. These are **initial MVP defaults, not clinical rules**.
- **Macros are entered manually** in MVP-8a (no food database). Options without
  enough data fall back to `needs_professional_review` / `insufficientData` in
  the engine (MVP-8b) — never invented.
- **Engine remains deterministic (MVP-8b);** OpenAI is never in the
  classification path. Approval into the plan is **MVP-9**, not now.
- Group access reuses the MVP-6 boundary (session cookie + Admin SDK +
  `request.auth.uid == nutritionistId` rules under `nutritionists/{uid}`).

### Consequences

Positive: the foundation is in place (types, persistence, macro/role authoring,
group manager) with all data owned and validated server-side; 8b can be pure
logic. Negative: macro entry is manual; the group manager + per-option nutrition
add professional-side surface (kept minimal/collapsed).

### Implications for future work

- MVP-8b: deterministic engine (`POST /api/replacements`) + results UI +
  "Find replacements" entry point, consuming these types.
- MVP-9: approve a candidate → append as an approved `FoodOption` in the slot.
- A food database integration is a later, separate option (`source:
  "nutrition_database"` is reserved).

---

## ADR-015: MVP-8b deterministic replacement engine

Date: 2026-06-09
Status: Accepted

### Context

MVP-8b builds the replacement engine on the MVP-8a foundation (macros, roles,
replacement groups). It must answer "what can replace 100g egg whites?" with
classified candidates, **deterministically** — OpenAI must never decide
equivalence (ADR-013).

### Decision

- **Engine is a pure function** (`lib/replacements/engine.ts`):
  `(saved plan, owned replacement groups, request) → ReplacementResult`. No
  OpenAI, no I/O, no randomness.
- **Candidate sourcing order:** (1) approved options in the same slot →
  `approved`; (2) explicitly assigned `replacementGroupId`; (3) groups matching
  the original role; (4) same-role options elsewhere in the plan. De-duplicated by
  food name (approved wins).
- **Quantity scaling:** scale a candidate to match the original's **primary macro
  for the role** (lean_protein/protein → protein; carbohydrate → carbohydrates;
  fat → fat; fruit/vegetable/dairy/mixed/other → calories). If the primary macro
  is missing on either side, do not invent a quantity → `needs_professional_review`.
- **Classification:** after scaling to the primary macro, compare secondary
  macros against the group/default **tolerance** (±20% cal, ±20% protein, ±5g
  fat). Within tolerance → `nutritionally_similar`; mildly outside (≤2× tolerance)
  → `needs_professional_review`; grossly outside → `not_suitable`. `insufficientData`
  when no candidates can be produced.
- **Reason/caution codes** are returned by the engine and localised in the UI
  (e.g. `approved_in_slot`, `same_replacement_group`, `similar_protein`,
  `higher_fat`, `missing_candidate_nutrition`, `outside_tolerance`).
- **Sort:** approved → nutritionally_similar(high) → (medium) →
  needs_professional_review → not_suitable.
- **API:** `POST /api/replacements` (Node, same-origin, verified session cookie,
  uid from cookie only, Admin SDK reads of the owned plan + groups). No OpenAI key.
- **UI:** a tester + grouped results on `/[locale]/professional/replacements`, and
  a "Find replacements" link from each food option (passes `mealId/foodSlotId/
  optionId`). Candidates are labelled "candidate for professional review — not
  automatically approved". **Approval into the plan is MVP-9, not here.**

### Consequences

Positive: consistent, auditable, safe suggestions grounded in stored data;
explainable via reason codes; no LLM cost. Negative: quality depends on the
professional entering macros + curating groups; tight default tolerances mark
genuinely different foods (e.g. egg whites vs ricotta) as not_suitable — the
professional widens tolerance per group when appropriate.

### Implications for future work

- MVP-9: approve a candidate → append it as an approved `FoodOption` in the slot.
- MVP-10: patient assistant exposes only approved replacements.
- A later optional LLM layer may *explain* the deterministic result; it must never
  change the classification.
