# PlanPal

PlanPal is an MVP for an AI-assisted nutrition plan companion.

The goal is **not** to generate diets from scratch. The goal is to help patients follow a professional nutrition plan created by their nutritionist.

## Core idea

> A nutritionist creates the plan.  
> The app helps the patient live with the plan.

PlanPal turns a static nutrition plan into a structured, interactive support layer for everyday questions such as:

- Can I replace this food?
- What can I cook with today’s ingredients?
- Can I swap lunch and dinner?
- What can I order when eating out?
- What should I buy for the week?

## MVP positioning

PlanPal is designed first as a SaaS tool for nutritionists, not as a generic consumer diet app.

The first validation goal is:

> Test whether one nutritionist would trust PlanPal with 3 real patients.

## Repository structure

```txt
docs/
  MVP_0_PRODUCT_SPEC.md
  MVP_1_DATA_MODEL.md

apps/
  web/

packages/
  shared/
```

## Tech direction

Planned stack:

- Next.js 15 PWA
- Firebase Auth
- Firestore
- OpenAI API
- Vercel

## MVP rule

The assistant must support the professional plan. It must not replace the nutritionist, prescribe treatment, or invent a new diet.
