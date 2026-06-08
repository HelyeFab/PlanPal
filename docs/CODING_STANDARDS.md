# PlanPal Coding Standards

Version: 0.1
Status: Draft

## Purpose

This document defines coding conventions for PlanPal.

The goal is consistency, maintainability and clarity across sessions and agents.

---

## Default Stack

The MVP stack is expected to be:

```txt
Next.js PWA
TypeScript
Firebase Auth
Firestore
OpenAI API
Vercel
```

Do not introduce major framework changes without recording a decision in `docs/DECISIONS.md`.

---

## General Principles

- Prefer simple code over clever code.
- Prefer explicit naming over abbreviations.
- Keep responsibilities separated.
- Do not add speculative abstractions.
- Do not build future infrastructure before the MVP needs it.
- Update docs when implementation changes project behaviour.

---

## TypeScript

Use TypeScript for application code.

Guidelines:

- Prefer explicit exported types for domain models.
- Avoid `any` unless there is a clear reason.
- Use union types for known status values.
- Keep shared domain types separate from UI components.
- Validate external input at boundaries.

Example:

```ts
type PlanStatus = "draft" | "active" | "archived";
```

---

## File Organisation

Expected structure once the app is scaffolded:

```txt
apps/
  web/
    app/
    components/
    lib/
    types/
    styles/
packages/
  shared/
```

This may evolve, but changes should be deliberate.

---

## Naming

Use clear domain language.

Preferred terms:

```txt
nutritionist
patient
mealPlan
meal
foodSlot
foodOption
question
rule
```

Avoid switching between equivalent words casually.

For example, do not mix `client`, `patient`, `user`, and `customer` in the same layer unless the distinction is intentional and documented.

---

## Architecture Boundaries

General rules:

- UI components render state and collect user input.
- Data access should live in service/helper modules or server routes.
- Server-only code must not be imported into client components.
- Secrets must never be exposed to the client.
- Shared types should not depend on runtime-specific code.

---

## Firestore Access

Follow the documented schema in:

```txt
docs/MVP_2_FIRESTORE_SCHEMA.md
```

Do not invent new paths casually.

If implementation needs a new path, update the schema document or create a decision record.

---

## UI

Before building UI, check:

```txt
docs/UI_REGISTRY.md
```

After building UI, run imprint mode and update the registry.

Avoid hardcoded visual values when existing tokens or established classes exist.

---

## Localisation

The app supports English and Italian from the start.

Supported locales:

- `en`
- `it`

Do not hardcode user-facing strings in components. Use the project i18n message system.

Locale-aware UI text should live in message files such as:

- `apps/web/messages/en.json`
- `apps/web/messages/it.json`

Shared types should use:

```ts
type SupportedLocale = "en" | "it";
```

### Conventions in this project

- The i18n library is `next-intl` with locale-prefixed routing (`/it`, `/en`);
  the default locale is `it`, fallback `en` (ADR-008).
- `SupportedLocale`, `SUPPORTED_LOCALES` and `DEFAULT_LOCALE` are exported from
  `@planpal/shared` — treat them as the single source of truth for locales.
- In server components use `getTranslations`; in sync server/client components
  use `useTranslations`. Read text by key, e.g. `t("hero.title")`.
- Use the locale-aware `Link` / `useRouter` from `apps/web/i18n/navigation.ts`
  for internal navigation so the active locale prefix is preserved. Plain `<a>`
  is fine for in-page hash anchors.
- Mock/demo data should carry stable message keys, not display copy.
- Italian copy must read naturally — not a word-for-word translation of English.

---

## Error Handling

For user-facing flows, handle:

- loading state
- empty state
- error state
- missing data
- invalid input

MVP does not need heavy polish, but obvious failure paths should not be ignored.

---

## Documentation

When behaviour changes, update docs.

Documentation types:

```txt
docs/DECISIONS.md          durable decisions
docs/UI_REGISTRY.md        UI consistency
docs/SECURITY_BOUNDARIES.md security and access assumptions
memory.md                  latest session handoff
```

---

## Commits

Use short, clear commit messages.

Examples:

```txt
Add Firestore schema doc
Add architect agent skill
Scaffold web app
Add patient plan types
```

---

## Standard

Code should be boring to maintain.

If future agents need to guess why something exists, document it or simplify it.
