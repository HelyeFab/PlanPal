# PlanPal MVP 1 Data Model

Version: 0.1
Status: Draft

## Purpose

This document defines the first domain model for PlanPal.

The data model is the foundation for:

- food substitutions
- recipe suggestions
- shopping lists
- eating-out guidance
- AI assistant context
- future white-label support

The key design decision is that a nutrition plan must not be stored as plain text only. It must be stored as structured data that the application and the assistant can reason over.

---

## Core Domain Objects

```txt
Nutritionist
  -> Patient
    -> MealPlan
      -> Meal
        -> FoodSlot
          -> FoodOption
```

---

## Nutritionist

Represents the professional who creates and owns patient plans.

```ts
type Nutritionist = {
  id: string;
  name: string;
  email: string;
  clinicName?: string;
  createdAt: string;
  updatedAt: string;
};
```

For the MVP, one nutritionist can own many patients.

Future white-label fields such as logo, colours, custom domain and billing plan should not be added yet. They belong in later versions.

---

## Patient

Represents the person following the plan.

```ts
type Patient = {
  id: string;
  nutritionistId: string;
  name: string;
  email?: string;
  activePlanId?: string;
  createdAt: string;
  updatedAt: string;
};
```

A patient belongs to one nutritionist in the MVP.

A patient may have zero, one or many plans, but only one active plan at a time.

---

## MealPlan

Represents a professional nutrition plan assigned to a patient.

```ts
type MealPlan = {
  id: string;
  nutritionistId: string;
  patientId: string;
  title: string;
  status: "draft" | "active" | "archived";
  language: "en" | "it";
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
```

| Status | Meaning |
|---|---|
| draft | The nutritionist is still editing the plan. The patient should not use it yet. |
| active | The current plan visible to the patient. |
| archived | Old plan retained for history. |

---

## Meal

Represents a meal within a plan.

```ts
type Meal = {
  id: string;
  planId: string;
  name:
    | "breakfast"
    | "morning_snack"
    | "lunch"
    | "afternoon_snack"
    | "dinner"
    | "custom";
  displayName: string;
  timeLabel?: string;
  sortOrder: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
```

Example:

```json
{
  "name": "breakfast",
  "displayName": "Colazione",
  "timeLabel": "07:30",
  "sortOrder": 1
}
```

---

## FoodSlot

A FoodSlot represents a functional part of a meal.

This is the most important object in the model.

A slot is not just a food. A slot means:

> This meal needs something of this type, and the patient may satisfy it using one of these approved options.

```ts
type FoodSlot = {
  id: string;
  mealId: string;
  label: string;
  category:
    | "protein"
    | "carbohydrate"
    | "vegetable"
    | "fruit"
    | "fat"
    | "dairy"
    | "drink"
    | "free"
    | "supplement"
    | "custom";
  required: boolean;
  sortOrder: number;
  notes?: string;
  options: FoodOption[];
  createdAt: string;
  updatedAt: string;
};
```

Example:

```json
{
  "label": "Protein option",
  "category": "protein",
  "required": true,
  "sortOrder": 2,
  "options": [
    {
      "foodName": "Albume",
      "quantity": 150,
      "unit": "g"
    },
    {
      "foodName": "Yogurt greco",
      "quantity": 170,
      "unit": "g"
    }
  ]
}
```

---

## FoodOption

Represents one approved option inside a FoodSlot.

```ts
type FoodOption = {
  id: string;
  foodName: string;
  quantity: number;
  unit:
    | "g"
    | "ml"
    | "piece"
    | "tbsp"
    | "tsp"
    | "portion"
    | "cup"
    | "slice"
    | "custom";
  notes?: string;
  isDefault?: boolean;
};
```

For MVP 0.1, nutritional macros are optional and should not block development.

Later, we may add:

```ts
type NutritionFacts = {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fibreG?: number;
};
```

But in the first MVP, we should rely on professional-approved substitutions rather than inventing equivalence from macro databases.

---

## Substitution Logic

The safest MVP substitution rule is:

> The patient can replace an option only with another option in the same FoodSlot.

Example:

```txt
Slot: Protein option
- 150g egg white
- 170g Greek yogurt
- 100g lean ricotta
```

Patient asks:

> Can I replace egg white?

Assistant can answer:

> Based on your nutritionist's plan, you can replace 150g egg white with 170g Greek yogurt or 100g lean ricotta.

The assistant should not invent replacements outside the configured slot unless the nutritionist has enabled broader rules.

---

## NutritionistRule

Rules are professional-level instructions that guide the assistant.

```ts
type NutritionistRule = {
  id: string;
  nutritionistId: string;
  title: string;
  content: string;
  appliesTo: "all_patients" | "specific_patient" | "specific_plan";
  patientId?: string;
  planId?: string;
  createdAt: string;
  updatedAt: string;
};
```

Examples:

```txt
Never suggest alcohol as a substitution.
Do not suggest calorie compensation after an unplanned meal.
If the question is outside the plan, ask the patient to contact the nutritionist.
```

---

## PatientQuestion

Stores patient interactions with the assistant.

```ts
type PatientQuestion = {
  id: string;
  nutritionistId: string;
  patientId: string;
  planId: string;
  question: string;
  answer: string;
  category?:
    | "substitution"
    | "recipe"
    | "shopping_list"
    | "eating_out"
    | "missed_meal"
    | "general";
  createdAt: string;
};
```

This helps the nutritionist understand what patients repeatedly ask.

It also supports the business value proposition:

> PlanPal reduces repetitive patient questions and improves plan adherence.

---

## MVP Data Boundaries

### Store now

- nutritionist
- patient
- meal plan
- meals
- slots
- approved food options
- nutritionist rules
- patient questions

### Do not store yet

- payments
- clinic hierarchy
- white-label branding
- macro database
- barcode products
- wearable data
- native app tokens

---

## Design Principle

When in doubt, prefer structured professional-approved data over assistant guessing.

The assistant should reason from the plan, not invent the plan.
