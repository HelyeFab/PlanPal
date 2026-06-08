# PlanPal MVP 2 Firestore Schema

Version: 0.1
Status: Draft

## Purpose

This document translates the PlanPal domain model into an MVP Firestore structure.

The first version should optimise for:

- simple reads
- clear ownership
- easy security rules
- easy AI context building
- minimal duplication

---

## High-Level Structure

```txt
nutritionists/{nutritionistId}
  patients/{patientId}
    plans/{planId}
      meals/{mealId}
        slots/{slotId}
    questions/{questionId}
  rules/{ruleId}
```

This keeps all client data under the professional who owns it.

---

## Collection: nutritionists

Path:

```txt
nutritionists/{nutritionistId}
```

Example document:

```json
{
  "id": "nutri_001",
  "name": "Lorena Nania",
  "email": "info@example.com",
  "clinicName": "Example Studio",
  "createdAt": "2026-06-08T10:00:00.000Z",
  "updatedAt": "2026-06-08T10:00:00.000Z"
}
```

### Notes

In the MVP, the `nutritionistId` should match the authenticated Firebase user UID.

This makes security rules simpler.

---

## Subcollection: patients

Path:

```txt
nutritionists/{nutritionistId}/patients/{patientId}
```

Example document:

```json
{
  "id": "patient_001",
  "nutritionistId": "nutri_001",
  "name": "Emmanuel Fabiani",
  "email": "patient@example.com",
  "activePlanId": "plan_001",
  "createdAt": "2026-06-08T10:05:00.000Z",
  "updatedAt": "2026-06-08T10:05:00.000Z"
}
```

### Notes

For MVP 0.1, clients do not need full account creation immediately.

We can start with professional-created client profiles and later add invited client login.

---

## Subcollection: plans

Path:

```txt
nutritionists/{nutritionistId}/patients/{patientId}/plans/{planId}
```

Example document:

```json
{
  "id": "plan_001",
  "nutritionistId": "nutri_001",
  "patientId": "patient_001",
  "title": "Initial Plan",
  "status": "active",
  "language": "it",
  "notes": "First structured MVP plan.",
  "createdAt": "2026-06-08T10:10:00.000Z",
  "updatedAt": "2026-06-08T10:10:00.000Z"
}
```

### Status Values

```txt
draft
active
archived
```

Only one plan should be active per client.

In the MVP, this can be enforced in application logic first.

---

## Subcollection: meals

Path:

```txt
nutritionists/{nutritionistId}/patients/{patientId}/plans/{planId}/meals/{mealId}
```

Example document:

```json
{
  "id": "meal_001",
  "planId": "plan_001",
  "name": "breakfast",
  "displayName": "Colazione",
  "timeLabel": "07:30",
  "sortOrder": 1,
  "notes": "",
  "createdAt": "2026-06-08T10:15:00.000Z",
  "updatedAt": "2026-06-08T10:15:00.000Z"
}
```

### Query Pattern

To render the daily plan:

```txt
Get all meals for active plan ordered by sortOrder.
```

---

## Subcollection: slots

Path:

```txt
nutritionists/{nutritionistId}/patients/{patientId}/plans/{planId}/meals/{mealId}/slots/{slotId}
```

Example document:

```json
{
  "id": "slot_001",
  "mealId": "meal_001",
  "label": "Protein option",
  "category": "protein",
  "required": true,
  "sortOrder": 1,
  "notes": "Choose one option from this slot.",
  "options": [
    {
      "id": "option_001",
      "foodName": "Albume",
      "quantity": 150,
      "unit": "g",
      "isDefault": true
    },
    {
      "id": "option_002",
      "foodName": "Yogurt greco",
      "quantity": 170,
      "unit": "g",
      "isDefault": false
    }
  ],
  "createdAt": "2026-06-08T10:20:00.000Z",
  "updatedAt": "2026-06-08T10:20:00.000Z"
}
```

### Why Embed Options Inside Slots?

For MVP 0.1, options should be embedded inside the slot document because:

- options are small
- options are always read with the slot
- substitutions depend on comparing options in the same slot
- it reduces query complexity

If options become large or reusable later, they can be promoted to their own subcollection.

---

## Subcollection: rules

Path:

```txt
nutritionists/{nutritionistId}/rules/{ruleId}
```

Example document:

```json
{
  "id": "rule_001",
  "nutritionistId": "nutri_001",
  "title": "Out of plan questions",
  "content": "If the question cannot be answered from the active plan, ask the client to contact the professional.",
  "appliesTo": "all_patients",
  "createdAt": "2026-06-08T10:25:00.000Z",
  "updatedAt": "2026-06-08T10:25:00.000Z"
}
```

### Rule Scopes

```txt
all_patients
specific_patient
specific_plan
```

For MVP 0.1, start with `all_patients` only.

---

## Subcollection: questions

Path:

```txt
nutritionists/{nutritionistId}/patients/{patientId}/questions/{questionId}
```

Example document:

```json
{
  "id": "question_001",
  "nutritionistId": "nutri_001",
  "patientId": "patient_001",
  "planId": "plan_001",
  "question": "Can I replace egg white?",
  "answer": "Based on your plan, you can replace 150g egg white with 170g Greek yogurt.",
  "category": "substitution",
  "createdAt": "2026-06-08T10:30:00.000Z"
}
```

### Why Store Questions?

Stored questions help show whether PlanPal is solving a real professional workflow problem.

The professional can see:

- repeated questions
- unclear plan sections
- common substitution requests
- possible improvements to future plans

---

## AI Context Read Pattern

When a client asks a question, the API should fetch:

1. patient document
2. active plan document
3. meals for active plan
4. slots for each meal
5. professional rules

Then build a compact assistant context.

Example context shape:

```ts
type AssistantPlanContext = {
  patient: {
    id: string;
    name: string;
  };
  plan: {
    id: string;
    title: string;
    language: "en" | "it";
  };
  meals: Array<{
    name: string;
    displayName: string;
    timeLabel?: string;
    slots: Array<{
      label: string;
      category: string;
      required: boolean;
      options: Array<{
        foodName: string;
        quantity: number;
        unit: string;
        isDefault?: boolean;
      }>;
    }>;
  }>;
  rules: Array<{
    title: string;
    content: string;
  }>;
};
```

---

## Security Assumptions

### Professional

A professional can:

- read and write their own profile
- read and write their own clients
- read and write plans under their own clients
- read and write their own rules
- read client questions under their own clients

### Client

Client access will be added after the professional workflow is proven.

For the first local/prototype build, the professional dashboard can be the only authenticated area.

---

## Suggested Firestore Security Direction

Later rules should check:

```txt
request.auth.uid == nutritionistId
```

for all paths under:

```txt
nutritionists/{nutritionistId}
```

Client access should use an explicit mapping table later, such as:

```txt
clientAccounts/{uid}
```

with fields:

```json
{
  "nutritionistId": "nutri_001",
  "patientId": "patient_001"
}
```

Do not add this until the client login flow is actually needed.

---

## Indexes

For MVP 0.1, likely indexes:

```txt
patients: activePlanId
plans: status
meals: sortOrder
slots: sortOrder
questions: createdAt
```

Firestore may request composite indexes later. Add them only when required by real queries.

---

## MVP Rule

Do not over-normalise.

Keep reads simple, keep ownership obvious, and keep the assistant context easy to build.
