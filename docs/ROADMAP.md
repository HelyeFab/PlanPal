# PlanPal Roadmap

This file keeps future ideas separate from the MVP.

## MVP Focus

PlanPal MVP should prove one thing:

> A professional can create a structured plan and a client can use it day to day.

## Delivered

- **MVP-4** — First product flow: professional plan builder + client preview.
- **MVP-5** — Professional Firebase Auth (email/password).
- **MVP-6** — Cloud persistence + real server security boundary.
- **MVP-7** — Professional approved-plan assistant v1 (answers from **approved
  options only** — safe but intentionally incomplete; see ADR-013).

## Next phases (corrected trajectory — ADR-013)

PlanPal's substitution vision is **nutritional equivalence within a professional
plan**, not approved-list lookup alone. The patient assistant remains a **core
PlanPal goal**, sequenced after replacement intelligence and patient access.

- **MVP-8 — Nutritional replacement engine.** Given a plan food (e.g. 100g egg
  whites), produce candidate replacements classified as approved /
  nutritionally_similar / needs_professional_review / not_suitable. See
  `docs/MVP_8_NUTRITIONAL_REPLACEMENT_ENGINE.md`.
- **MVP-9 — Professional review and approval of suggested replacements.** The
  professional reviews candidates and approves them into the plan; only then are
  they "approved" for the patient.
- **MVP-10 — Patient access and patient assistant.** Patient login/access mapping
  + a careful patient-facing assistant that never implies approval for
  unreviewed candidates.

## MVP 0.1

- Create professional account
- Create client profile
- Create structured plan
- Add meals
- Add slots
- Add approved options
- Client can view the active plan
- Client can ask simple questions based on the active plan

## Not MVP

- PDF import
- White label branding
- Clinic accounts
- Native mobile app
- Billing
- Public marketplace
- Barcode scanning
- Wearable integrations
- Advanced analytics

## Later

- Import from PDF
- Custom branding
- Multi-professional accounts
- Weekly shopping list
- Eating-out helper
- Travel helper
- Fridge helper
- Basic adherence tracking
- Client question dashboard

## Rule

Do not build the dream product first.

Build the smallest trusted workflow that can be tested with real users.
