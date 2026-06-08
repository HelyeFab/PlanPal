---
name: decide
description: Record important project decisions so future sessions understand what was chosen, why, and what it affects.
---

# Decide Skill

The decide skill records durable project decisions.

Use it when a product, architecture, workflow, data, UI, deployment, or tooling choice will affect future work.

The goal is to prevent future agents from reopening settled choices or accidentally contradicting them.

---

## Core Rule

Important decisions belong in `docs/DECISIONS.md`.

Chat is not enough.

Memory is not enough.

If future work depends on the decision, save it.

---

## When To Use

Use decide mode when:

- choosing a framework, service, database, deployment target, or architecture pattern
- changing a documented approach
- accepting a trade-off
- rejecting an apparently obvious alternative
- deciding what belongs in the MVP versus later
- changing data model structure
- defining a security boundary
- establishing a UI/design rule
- choosing a workflow convention

Do not record tiny implementation details unless they have long-term consequences.

---

## Step 1 — Identify the Decision

State the decision clearly.

```txt
Decision to record: [decision]
```

If the decision is not yet clear, return to architect mode first.

Decide mode records decisions. It does not make unclear decisions by itself.

---

## Step 2 — Explain the Context

Capture why the decision came up.

Include the problem, constraint, or trade-off that made the decision necessary.

```txt
Context: [why this decision exists]
```

---

## Step 3 — Record the Decision

Use `docs/DECISIONS.md`.

If the file does not exist, create it.

Do not overwrite existing decisions.

Append the new decision unless updating a previous decision.

Use this format:

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

- [cost or limitation]

### Implications for future work

- [what future agents must do or avoid]
```

ADR means Architecture Decision Record, but the file can include product and workflow decisions too.

---

## Step 4 — Updating an Existing Decision

If a previous decision is replaced, do not delete it.

Mark the old decision as superseded.

Example:

```markdown
Status: Superseded by ADR-004
```

Then add the new ADR explaining why the decision changed.

Historical decisions are useful. Do not erase the trail.

---

## Step 5 — Keep Decisions Concise

A decision record should be short enough to read later.

Do not include chat transcripts.

Do not include every argument considered.

Capture:

- the decision
- the reason
- the trade-off
- what future work must respect

---

## Step 6 — Confirm What Was Saved

After saving, report:

```txt
Decision recorded in docs/DECISIONS.md:

ADR-[number]: [title]

Future work should respect: [main implication]
```

---

## What Decide Mode Is Not

Decide mode is not architect mode.

Decide mode is not a debate.

Decide mode is not memory save.

Decide mode is not a dumping ground for preferences.

Decide mode is not where every tiny coding choice is recorded.

---

## Standard

Record decisions that would confuse a future agent if they were missing.

If the future agent would ask, "Why are we doing it this way?", the answer probably belongs in `docs/DECISIONS.md`.
