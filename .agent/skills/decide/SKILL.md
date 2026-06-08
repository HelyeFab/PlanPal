---
name: decide
description: Record important project decisions so future sessions understand what was chosen, why, and what it affects.
---

# Decide Skill

Decide mode records durable project decisions.

Use it when a product, architecture, workflow, data, UI, deployment, or tooling choice will affect future work.

---

## Core Rule

Important decisions belong in `docs/DECISIONS.md`.

Chat is not enough. Memory is not enough.

If future work depends on the decision, save it.

---

## When To Use

Use decide mode when:

- choosing a framework, service, database, deployment target, or architecture pattern
- changing a documented approach
- accepting a trade-off
- rejecting an obvious alternative
- deciding MVP versus later
- changing data model structure
- defining a security boundary
- establishing a UI/design rule
- choosing a workflow convention

Do not record tiny implementation details unless they have long-term consequences.

---

## Step 1 — Identify the Decision

```txt
Decision to record: [decision]
```

If the decision is unclear, return to architect mode first.

---

## Step 2 — Explain Context

Capture why the decision came up.

```txt
Context: [why this decision exists]
```

---

## Step 3 — Record the Decision

Use `docs/DECISIONS.md`.

If the file does not exist, create it.

Do not overwrite existing decisions. Append unless updating a previous decision.

Format:

```markdown
## ADR-[number]: [Decision Title]

Date: [YYYY-MM-DD]
Status: Accepted

### Context
[Why the decision was needed]

### Decision
[What was decided]

### Reasoning
[Why this option was chosen]

### Consequences

Positive:
- [benefit]

Negative / trade-offs:
- [cost]

### Implications for future work
- [what future agents must do or avoid]
```

---

## Step 4 — Updating an Existing Decision

If a previous decision is replaced, do not delete it.

Mark it as superseded and add a new ADR.

---

## Step 5 — Confirm Save

```txt
Decision recorded in docs/DECISIONS.md:

ADR-[number]: [title]

Future work should respect: [main implication]
```

---

## Standard

If a future agent would ask, "Why are we doing it this way?", the answer probably belongs in `docs/DECISIONS.md`.
