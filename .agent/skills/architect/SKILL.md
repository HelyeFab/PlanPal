---
name: architect
description: Think before building. Read project truth, align language, surface implementation-changing decisions, and produce a confirmed blueprint before code is written.
---

# Architect Skill

Architect mode stops the agent from rushing into implementation before the work is clear.

Use it before building any meaningful feature, workflow, API route, UI flow, data model, or architectural change.

Architect mode produces a blueprint. Execution begins only after explicit confirmation.

---

## Core Rule

Do not write production code in architect mode.

Do not modify files unless the user explicitly asks for the blueprint to be saved.

---

## Step 1 — Read Project Truth First

Before asking questions, inspect existing context.

Read relevant files in this order when available:

```txt
memory.md
README.md
.agent/AGENT_OPERATING_SYSTEM.md
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
docs/UI_REGISTRY.md
```

Only read files relevant to the requested work.

If existing docs already answer something, do not ask again.

---

## Step 2 — Restate the Task Briefly

```txt
I understand we are planning [feature/change].
The goal is [goal].
The likely affected areas are [areas].
```

If the request is ambiguous, say what is ambiguous.

---

## Step 3 — Align on Language

Identify 3 to 5 terms that could affect implementation.

For each term, state your working definition and ask for confirmation.

```txt
Before we design this, let me check the language:

- [Term]: I understand this to mean [definition]. Correct?
- [Term]: I am treating this as [definition]. Is that right?
```

Do not continue with the blueprint until key language is aligned.

---

## Step 4 — Surface Only Implementation-Changing Decisions

Ask only decisions that materially change what gets built.

For each decision:

```txt
Decision: [decision]

My recommendation: [recommendation]

Why: [reason]

Does this work, or do you want to handle it differently?
```

Work from highest-impact decisions to lowest-impact decisions.

---

## Step 5 — Check Existing Decisions

If the requested work touches a decision in `docs/DECISIONS.md`, respect it.

Do not reopen settled decisions unless:

- the user explicitly asks to reconsider
- the decision conflicts with new facts
- implementation proves the decision is not workable

If a new major decision is made, flag that it should be recorded in `docs/DECISIONS.md`.

---

## Step 6 — Produce the Blueprint

When key decisions are resolved, say:

```txt
Blueprint ready.
```

Then produce:

```markdown
## Implementation Blueprint — [Feature Name]

### What we are building
[One clear paragraph]

### Language agreed
- [Term]: [definition]

### Decisions made
- [Decision]: [chosen approach and reason]

### Files likely affected
- [file or directory]

### Data model impact
[None / describe impact]

### UI impact
[None / describe impact]

### Security impact
[None / describe impact]

### Implementation steps
1. [step]
2. [step]

### Assumptions
- [assumption]

### Out of scope
- [what we are deliberately not doing]
```

---

## Step 7 — Wait for Confirmation

After presenting the blueprint, stop.

Do not begin execution until the user explicitly confirms.

---

## Warning Signs

Stop and clarify if:

- the feature conflicts with current architecture
- required decisions are missing
- access rules are unclear
- UI or architecture drift is likely
- implementation still feels vague

---

## Standard

A good blueprint makes execution almost boring.

If implementation still feels vague, architect mode is not finished.
