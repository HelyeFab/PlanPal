# PlanPal UI Registry

Version: 1.3
Status: Reference baseline + implemented patterns (builder + auth + cloud save + assistant + replacement engine + approval modal + patient preview)

## Purpose

This file stores reusable UI visual patterns for PlanPal.

It is updated by the `.agent/skills/imprint` skill after UI components are built or audited.

The goal is to prevent UI drift across sessions.

This document has two layers:

1. **Design intent** — the visual direction derived from the `ui-reference/`
   screenshots (aspirational, not tied to specific classes).
2. **Implemented patterns** — the actual Tailwind classes and components in
   `apps/web`. When building new UI, match the *implemented* layer.

---

## UI Reference Source

Initial visual reference screenshots are stored in:

```txt
ui-reference/
```

These screenshots are design input for the first PlanPal UI shell.

They are not runtime app assets unless explicitly moved into the app later.

The references show a clean healthcare SaaS/mobile style:

- very light page backgrounds
- white rounded cards
- soft blue primary accents
- dark navy/black typography
- pill-shaped navigation and chips
- large border radius
- generous spacing
- minimal shadows
- calm, clinical, friendly interface language

PlanPal should borrow the visual system, not the medical content.

Do not copy doctors, scans, appointments, hospital-specific labels or medical dashboard content. Translate the style into a nutrition-plan companion.

---

## Design Direction

PlanPal should feel like:

```txt
calm clinical SaaS + friendly nutrition companion
```

Avoid:

- playful gamified diet-app clutter
- harsh medical emergency aesthetics
- heavy dashboards too early
- dense tables on mobile
- dark UI for the MVP

Prefer:

- soft surfaces
- clear hierarchy
- rounded cards
- reassuring blue accents
- mobile-first structure
- spacious layouts
- simple plan cards and meal sections

---

## Design Intent Baseline — from UI references

Aspirational patterns derived from the references (general direction; the
implemented layer below is the source of truth for actual classes).

| Property | Direction |
| --- | --- |
| Page background | Very light cool grey / blue-tinted surface |
| App shell background | Soft off-white container with subtle contrast |
| Card background | White or near-white |
| Card border | Very subtle hairline border |
| Card radius | Large radius, usually `rounded-3xl`; smaller cards `rounded-2xl` |
| Card shadow | Soft and restrained, low-opacity blue/grey |
| Primary accent | Clear healthcare blue for primary actions, selected chips, active states |
| Secondary accent | Very pale blue/lavender surfaces for selected panels |
| Text primary | Deep navy/near-black |
| Text secondary | Muted slate/grey |
| Text muted | Soft grey |
| Primary button | Pill button, blue background, white text |
| Secondary button | White or pale surface, subtle border/shadow, dark text |
| Input | White/pale blue-grey, rounded-full for search/input bars |
| Focus state | Blue ring, visible but soft |
| Navigation | Pills/chips rather than hard rectangular tabs |
| Mobile cards | Stacked rounded cards with generous vertical spacing |
| Desktop dashboard | Card grid layout with strong whitespace and grouped sections |

---

## Layout Principles

### Mobile

The second reference is the strongest guide for PlanPal mobile.

Use:

- top greeting/header area
- search or quick action pill when relevant
- large hero/action card
- vertical sections with rounded cards
- horizontal chips for meal categories or days
- bottom spacing suitable for PWA/mobile browser use

### Desktop

The first reference is the strongest guide for PlanPal professional dashboard.

Use:

- wide soft app container
- horizontal navigation pills
- card-based dashboard grid
- right-side or secondary panels only when useful
- clear separation between plan editor, client summary and recent questions

---

## PlanPal-Specific Translation

Map medical UI concepts into PlanPal concepts:

| Reference concept | PlanPal equivalent |
| --- | --- |
| Doctor cards | Client cards or meal-plan cards |
| Appointment cards | Scheduled meals or check-ins |
| Lab result cards | Plan adherence summaries or nutrition plan sections |
| Category pills | Meals, days, plan sections, food slots |
| Search doctor | Search client, meal, food option or plan |
| Book appointment button | Create plan, add meal, ask assistant, generate shopping list |

---

# Implemented Patterns

Everything below reflects what is actually built in `apps/web`. **Match this
layer when adding UI.**

## Implementation

Tailwind CSS v4 with CSS-first config. Design tokens live in
`apps/web/app/globals.css` under `@theme`. There is **no** `tailwind.config.ts`
(see ADR-007). Tokens generate utilities automatically, e.g. `--color-brand`
→ `bg-brand` / `text-brand`, `--radius-card` → `rounded-card`.

### Design tokens (`@theme`)

| Token | Value | Generates |
| --- | --- | --- |
| `--color-canvas` | `#eef2fb` | `bg-canvas` page background |
| `--color-surface` | `#ffffff` | `bg-surface` cards |
| `--color-surface-muted` | `#f6f8fd` | `bg-surface-muted` inputs/insets |
| `--color-ink` | `#14233d` | `text-ink` primary text |
| `--color-muted` | `#5b6b86` | `text-muted` secondary text |
| `--color-faint` | `#93a1ba` | `text-faint` captions |
| `--color-brand` | `#2f6bff` | `bg-brand` / `text-brand` |
| `--color-brand-strong` | `#1f4fd1` | hover / pressed |
| `--color-brand-soft` | `#e7eeff` | `bg-brand-soft` chips |
| `--color-mint` | `#2bb673` | success / active status |
| `--color-amber` | `#f5a524` | draft / warning status |
| `--color-line` | `#e4eafa` | `border-line` hairline borders |
| `--radius-card` | `1.5rem` | `rounded-card` |
| `--radius-pill` | `9999px` | `rounded-pill` |
| `--shadow-card` | soft elevation | `shadow-card` (hero) |
| `--shadow-soft` | low elevation | `shadow-soft` (cards) |

---

## Implemented Baseline

| Property | Correct pattern |
| --- | --- |
| Page background | `bg-canvas` (set on `body` in globals.css) |
| Card background | `bg-surface` |
| Card border | `border border-line` |
| Card radius | `rounded-card` (rows/small cards use `rounded-2xl`) |
| Card shadow | `shadow-soft` (cards), `shadow-card` (hero) |
| Card padding | `p-5` (standard), `p-6 sm:p-8` (hero) |
| Primary button | `ActionPill variant="solid"` → `bg-brand text-white hover:bg-brand-strong rounded-pill` |
| Secondary button | `ActionPill variant="soft"` → `bg-brand-soft text-brand` |
| Ghost / nav button | `ActionPill variant="ghost"` → `text-muted hover:bg-white hover:text-ink` |
| Text primary | `text-ink` |
| Text secondary | `text-muted` |
| Text muted | `text-faint` |
| Input background | `bg-surface-muted` |
| Input border | `border border-line` |
| Input shape | `rounded-pill` field wrapper |
| Focus state | `:focus-visible` → `2px solid var(--color-brand)` (global, in globals.css) |
| Status: active | `bg-mint/15 text-mint` pill |
| Status: draft | `bg-amber/15 text-amber` pill |
| Status: archived | `bg-muted/15 text-muted` pill |
| Form input/select/textarea | `w-full rounded-2xl border border-line bg-surface-muted px-3 py-2 text-sm text-ink placeholder:text-faint` + `focus-visible:outline-2 focus-visible:outline-brand` |
| Field label | `text-xs font-semibold text-muted` (associated `<label htmlFor>`) |
| Field error | append `border-amber`; message `text-xs text-amber`; input gets `aria-invalid` |
| Toggle / switch | `role="switch"` button, `h-6 w-10 rounded-pill`, track `bg-brand` (on) / `bg-line` (off), knob `size-4 rounded-full bg-white` |
| Remove (row) button | round `size-7 rounded-full border border-line bg-surface text-muted hover:border-amber hover:text-amber`, `×` glyph, `aria-label` |

---

## Layout

- Page container: `mx-auto max-w-5xl px-4 sm:px-6`.
- Mobile-first: single column, `grid gap-5` widening to `sm:grid-cols-2` / `lg:grid-cols-3`.
- Header: sticky, `bg-canvas/80 backdrop-blur`, `border-b border-line/70`.
- **Desktop header (md+):** one row — logo · nav pills (`md:flex`) · (language
  switcher + CTA).
- **Mobile header (<md):** two rows — row 1 is logo + primary CTA only; row 2 is
  a horizontally scrollable pill nav (`min-w-0 flex-1 overflow-x-auto`) with the
  language switcher pinned right (`shrink-0`). The switcher is moved out of row 1
  on mobile to prevent the top row overflowing narrow phones (~360–375px).
- **Sticky-header anchor offset:** `html { scroll-padding-top: 7rem }` in
  globals.css so in-page `#anchor` jumps clear the sticky header (covers the
  taller two-row mobile header). In-page section ids: `#today`, `#plan`,
  `#assistant`, `#shopping` sit on the card/section, not on inner links.

---

## Component Patterns

Components live in `apps/web/components/`.

- **AppShell** (`app-shell.tsx`) — sticky header (inline SVG brand mark, nav
  pills, language switcher, primary CTA), `max-w-5xl` main, footer disclaimer.
  Owns nav state and the responsive header layout above.
- **HeroCard** (`hero-card.tsx`) — blue gradient panel
  (`bg-gradient-to-br from-brand to-brand-strong`), white text, decorative
  blurred blobs, greeting + promise + action pills.
- **PlanCard** (`plan-card.tsx`) — active-plan summary with status badge,
  notes, meal/language stats. Status/language typed with `@planpal/shared`;
  title/notes passed in already localised.
- **MealCard** (`meal-card.tsx`) — `<li>` row with accent dot, name, time,
  slot summary. Used in the "Today's meals" list.
- **ActionPill** (`action-pill.tsx`) — the shared pill primitive. Renders a
  semantic `<a>` when `href` is set, otherwise a `<button>`. Variants:
  `solid` | `soft` | `ghost`, plus `active` and optional `icon`.
- **LanguageSwitcher** (`language-switcher.tsx`, client) — EN | IT segmented
  pill: outer `inline-flex rounded-pill border border-line bg-surface-muted p-0.5`
  wrapping two `<button>`s (`rounded-pill px-2.5 py-1 text-xs font-semibold`);
  active locale `bg-brand text-white`, inactive `text-muted hover:text-ink`.
  Uses `aria-pressed` and a `role="group"` labelled by `language.label`. Keeps
  the current path via the locale-aware router; no persisted preference (MVP).

### Plan builder patterns (`components/professional/`, route `/[locale]/professional`)

- **Form primitives** (`fields.tsx`) — `TextField`, `TextAreaField`,
  `NumberField`, `SelectField`, `ToggleField`. All share the form-input baseline
  above and own their `<label>` association via `useId`. Reuse these for any new
  form rather than hand-rolling inputs.
- **SectionCard** (`section-card.tsx`) — standard builder card: `rounded-card
  border border-line bg-surface p-5 shadow-soft`, heading + optional subtitle +
  optional header action (e.g. an "Add" pill). `RemoveButton` is the round `×`
  control for repeatable rows.
- **Save toolbar** — the builder toolbar leads with a solid **Save** pill
  (`ActionPill variant="solid" icon="☁"`) + an inline status text
  (`text-xs font-medium`): `text-mint` when Saved, `text-muted` for "Unsaved
  changes", `text-amber` on error, "Saving…" while in flight. A `flex-1` spacer
  pushes Load example / Clear to the right. Save status derives from a `lastSaved`
  snapshot vs the current state (dirty check) — kept in reducer state (not a ref)
  so it is readable during render.
- **Builder layout** — two columns on `lg`:
  `grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]`. Left column = stacked builder
  cards (`flex flex-col gap-5`); right column = `aside` that is
  `lg:sticky lg:top-24 lg:self-start` holding the validation checklist + live
  preview. Mobile stacks (preview last).
- **Nested repeatable rows** — meal → slot → option editors nest in progressively
  lighter surfaces (`bg-surface-muted/50` → `bg-surface` → `bg-surface-muted/60`)
  so depth reads visually. Each level has an inline "Add" pill and a `RemoveButton`.
- **ClientPlanPreview** (`client-plan-preview.tsx`) — a phone-style read-only card
  (`rounded-[1.25rem]` inner, brand gradient header) rendering the client
  "today's plan" live from builder state; hides empty/in-progress options.
  **Status display rule** (single source of truth for the badge/warning):
  - draft (default) → badge **Draft/Bozza** + amber "client can't see this yet" warning;
  - draft + "Preview as active" toggle on → badge **Preview/Anteprima**, no warning;
  - active → badge **Active/Attivo**, no warning.
  The badge and the warning are always derived from the same status — never show
  an "active" badge alongside a draft warning.
- **AppShell `nav="minimal"`** — inner pages (e.g. the builder, sign-in) use the
  minimal header (logo links home + language switcher + `AccountMenu`, no section
  nav / CTA).

### Replacement-data patterns (MVP-8a)

- **Option "Nutrition & role"** (`food-option-editor.tsx`) — a collapsed section
  toggled by a small text button (`▸/▾`, `text-brand`). When open: a role
  `SelectField` (with a "— none —" option) + a macro grid (5 `NumberField`s:
  calories/protein/carbs/fat/fibre) in a bordered `bg-surface` panel. Keeps the
  dense builder calm; macros are optional and never invented.
### Patient preview patterns (MVP-10a, `components/patient/`, route `/[locale]/professional/patient-preview`)

- **Patient plan view** (`patient-plan-view.tsx`) — calm, mobile-first, distinct
  from the dense builder: `rounded-card` **meal cards** (bold name + faint
  `timeLabel`), each slot a small uppercase `text-faint` label over **tappable food
  rows** (`button`, `bg-surface-muted/50`, hover `border-brand/40 bg-brand-soft/40`)
  showing food name + amount on the left and a `text-brand` "What instead? ⇄"
  affordance on the right. A `bg-brand-soft text-brand` preview banner marks it as
  the client view. Read-only — no editor primitives, no professional chrome.
- **Patient replacement sheet** (`patient-replacement-sheet.tsx`) — a **bottom
  sheet on mobile, centered modal on larger** (`fixed inset-0 bg-ink/40 flex
  items-end sm:items-center`, inner `rounded-t-card sm:rounded-card max-w-md
  max-h-[88dvh] overflow-y-auto`). Header = "Instead of {food}" + × close; a role/
  meal sentence; then three colour-cued sections: **You can use** (mint border/bg) ·
  **Ask your professional** (neutral, with a not-approved note) · **Not a good
  match** (muted, **collapsed** behind a `▸/▾` toggle). Never renders engine
  internals — only localised patient wording from `presentReplacements()`.

- **Replacement tester + results** (`replacement-tester.tsx`, top of
  `/[locale]/professional/replacements`, MVP-8b) — a `SectionCard` with a
  `SelectField` (pick a saved-plan food) + a solid "Find replacements" pill
  (`icon="⇄"`). Results are grouped **Approved / Needs review / Not suitable**;
  each candidate row shows food name, scaled `suggestedQuantity`, a classification
  badge (mint/brand-soft/amber/muted by class), a confidence chip, localised
  reason codes (`·`-joined) + amber caution codes, and a "candidate for
  professional review" note. States: loading / no-plan / insufficient-data /
  no-candidates / error. Deep-linkable via `?mealId&foodSlotId&optionId` from the
  builder's per-option "Find replacements" link (`food-option-editor.tsx`).
- **Approval modal** (`approve-replacement-modal.tsx`, MVP-9) — the app's first
  **modal pattern**: a fixed overlay `fixed inset-0 z-40 flex items-center
  justify-center bg-ink/40 p-4` wrapping a `max-w-md` scrollable
  `rounded-card border border-line bg-surface p-5 shadow-card` (`role="dialog"
  aria-modal="true"`). Mount it only while open (so its `useState` initialises
  from the item). Contents: title + item name, editable fields (the form
  primitives), a `bg-brand-soft text-brand` safety line, an amber error line, and
  a right-aligned Cancel (ghost) + Confirm (solid) pill row. Reuse this shape for
  future modals.
- **Candidate approval CTAs** (in `replacement-tester.tsx`) — Needs-review
  candidates get an "Approve" soft pill (`icon="✓"`, opens the modal); approved
  ones get an "Already approved" `bg-mint/15 text-mint` chip; not-suitable get no
  CTA. After approval the search re-runs (server truth).
- **Replacement group manager** (`components/replacements/`, route
  `/[locale]/professional/replacements`) — `ReplacementGroupManager` lists
  `GroupEditorCard`s (each a `SectionCard`): name, role, a 3-up tolerance grid
  (calories ±% / protein ±% / fat ±g), and member foods (each: food name + qty +
  unit + macro grid). Per-group **Save** pill (cloud-backed, one group per save)
  + round `RemoveButton` delete; a manager-level Saving/Saved/error status line.
  Client-rendered after the initial load (same hydration-safe pattern as the
  builder). Linked from the builder header (`⇄ Replacement groups`).

### Assistant patterns (`components/assistant/`, route `/[locale]/professional/assistant`)

- **AssistantPanel** (`assistant-panel.tsx`, client) — a focused **plan-helper**,
  not a generic chatbot. Two columns on `lg`
  (`grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]`): left = a `SectionCard`
  with a `rounded-2xl` textarea (same field styling), a solid "Ask" pill
  (`icon="✦"`, shows "Asking…" while loading), a disclaimer, and example-question
  chips (`ActionPill variant="soft"`); right = a sticky answer aside.
- **Answer card** — `safetyLevel` badge (`ok` → `bg-mint/15 text-mint`;
  `needs_professional_review` → `bg-amber/15 text-amber`; `refused` →
  `bg-muted/15 text-muted`), the answer (`whitespace-pre-wrap`), a "grounded in
  your saved plan" caption, and follow-up question links (`text-brand`).
- **States** — loading / empty (dashed hint) / no-plan (amber card) / error
  (amber card), all localised. Single-turn (ask → answer); no chat history UI.
- Linked from the builder header via `ActionPill localeHref="/professional/assistant"`.

### Auth patterns (`components/auth/`, route `/[locale]/sign-in`)

- **Sign-in card** (`sign-in-form.tsx`) — single centered card
  (`mx-auto max-w-md`, `rounded-card border border-line bg-surface p-6 shadow-card`)
  with `h1` title + subtitle, the shared `TextField` primitives (now support
  `type="email" | "password"` + `autoComplete`), an error alert
  (`rounded-2xl bg-amber/15 text-amber`, `role="alert"`), and a full-width solid
  submit pill (`ActionPill type="submit" className="w-full justify-center"`).
- **Auth states** — while auth resolves, `RequireAuth` shows a calm centered
  status line (`role="status"`); signed-out shows the redirect line; missing
  Firebase config shows a centered "not configured" card. Same pattern (server +
  first client render identical) so there is no hydration flash.
- **AccountMenu** (`account-menu.tsx`) — email (`hidden sm:inline`, truncated) +
  a ghost "Sign out" pill; renders nothing when signed out.
- All auth copy is localised (`auth` namespace); Firebase error codes map to
  friendly localised messages via `lib/auth/auth-errors.ts`.

### Accessibility baseline

- Semantic headings (`h1` in hero, `h2`/`h3` per section), one `h1` per page.
- Buttons are `<button>`, links are `<a>`; nav uses `aria-current="page"`.
- Inputs have associated `<label>` (visually hidden via `sr-only` where needed).
- Global visible `:focus-visible` ring.
- Decorative SVG/blobs marked `aria-hidden="true"`.
- All visible copy (and `aria-label`s such as the nav landmark) comes from i18n
  messages — no hardcoded user-facing strings in components (ADR-008). The only
  literal text in components is the brand wordmark "PlanPal".

---

## Rule

When UI changes, run imprint mode and update this file.

The screenshots define the visual direction, but implemented components define
the reusable pattern library. Reference screenshots in `ui-reference/` are
**inspiration only** — never used as in-app image assets.
