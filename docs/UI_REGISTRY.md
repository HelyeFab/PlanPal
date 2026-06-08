# PlanPal UI Registry

Version: 0.4
Status: Reference baseline + implemented patterns (mobile responsiveness audited)

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
