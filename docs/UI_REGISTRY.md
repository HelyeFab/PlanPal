# PlanPal UI Registry

Version: 0.3
Status: Reference-derived baseline established

## Purpose

This file stores reusable UI visual patterns for PlanPal.

It is updated by the `.agent/skills/imprint` skill after UI components are built or audited.

The goal is to prevent UI drift across sessions.

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

## Baseline — Established From UI References

| Property | Correct pattern |
| --- | --- |
| Page background | Very light cool grey / blue-tinted surface, e.g. `bg-slate-50`, `bg-blue-50/40`, or `#F5F7FB` |
| App shell background | Soft off-white container with subtle contrast against page background |
| Card background | White or near-white, e.g. `bg-white` / `bg-white/90` |
| Card border | Very subtle border, e.g. `border border-slate-100` or `border-white/70` |
| Card radius | Large radius, usually `rounded-3xl`; smaller cards may use `rounded-2xl` |
| Card shadow | Soft and restrained, e.g. `shadow-sm`, `shadow-md`, or custom low-opacity blue/grey shadow |
| Primary accent | Clear healthcare blue, e.g. `blue-500` / `blue-600`; use for primary actions, selected chips and active states |
| Secondary accent | Very pale blue/lavender surfaces for selected backgrounds and panels |
| Text primary | Deep navy/near-black, e.g. `text-slate-950` or `text-[#111827]` |
| Text secondary | Muted slate/grey, e.g. `text-slate-500` or `text-slate-600` |
| Text muted | Soft grey, e.g. `text-slate-400` |
| Heading style | Rounded, modern sans-serif; large headings should feel soft but confident |
| Body text | Clear sans-serif, medium size, high readability, avoid tiny grey text for important plan details |
| Primary button | Pill button, blue background, white text, rounded-full or rounded-2xl |
| Secondary button | White or pale surface, subtle border/shadow, dark text |
| Icon button | Circular white button with subtle shadow/border |
| Input background | White or very pale blue-grey, rounded-full for search/input bars |
| Input border | Minimal or none; rely on soft surface contrast |
| Focus state | Blue ring, visible but soft, e.g. `focus:ring-2 focus:ring-blue-500/30` |
| Navigation | Pills/chips rather than hard rectangular tabs |
| Mobile cards | Stacked rounded cards with generous vertical spacing |
| Desktop dashboard | Card grid layout with strong whitespace and clear grouped sections |

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

## Component Patterns

No implemented component patterns recorded yet.

After the first UI shell is built, run imprint mode and update this section with actual classes from the app.

---

## Rule

When UI changes, run imprint mode and update this file.

The screenshots define the visual direction, but implemented components define the reusable pattern library.
