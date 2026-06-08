# PlanPal MVP 0 Product Specification

Version: 0.1
Status: Draft

## Product Goal

Help patients follow a nutrition plan created by a professional nutritionist.

## Success Criteria

A nutritionist is willing to test the platform with 3 real patients.

## Users

- Nutritionist
- Patient

## Audience and Languages

PlanPal targets both English-speaking and Italian-speaking audiences. The
Italian market is a core target from the start, not a later addition.

The app is bilingual from the first scaffold (ADR-008):

- `en` — English
- `it` — Italian (default UI locale)

Plan content, UI copy and assistant replies are all locale-aware.

## Core Features

1. Create patient
2. Create structured meal plan
3. View meal plan
4. Ask AI questions against the active plan
5. Generate shopping list

## Non Goals

- AI generated diets
- Calorie tracking
- Barcode scanning
- Wearables
- Native mobile apps
- White label

## Core Principle

The AI supports the plan.
The AI does not replace the nutritionist.
