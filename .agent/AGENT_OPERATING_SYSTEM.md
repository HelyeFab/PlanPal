# PlanPal Agent Operating System

Version: 0.2
Status: Draft

## Purpose

This document defines how an AI coding agent should work on PlanPal.

The goal is to make the agent behave like a disciplined engineering partner, not like a random code generator.

PlanPal should be built and maintained through a repeatable workflow that preserves context, prevents scope drift, protects architectural decisions, and keeps the product coherent over time.

---

## Core Principle

Chat is the workshop.

GitHub is the source of truth.

Important project knowledge must be saved in the repository, not left only in conversation history.

---

## Source of Truth

The agent should treat these locations as authoritative:

```txt
README.md
memory.md
docs/
.agent/
```

### Durable product and project truth

Durable PlanPal knowledge belongs in `docs/`.

Examples:

```txt
docs/MVP_0_PRODUCT_SPEC.md
docs/MVP_1_DATA_MODEL.md
docs/MVP_2_FIRESTORE_SCHEMA.md
docs/MVP_3_AI_ASSISTANT_SPEC.md
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
docs/UI_REGISTRY.md
```

### Current session state

Current handoff state belongs in root `memory.md`.

`memory.md` should not replace project documentation. It should only explain where the last session stopped and what the next session should do first.

### Agent workflow rules

Reusable agent behaviour belongs in `.agent/`.

Examples:

```txt
.agent/skills/architect/SKILL.md
.agent/skills/execute/SKILL.md
.agent/skills/review/SKILL.md
.agent/skills/recover/SKILL.md
.agent/skills/remember/SKILL.md
.agent/skills/imprint/SKILL.md
.agent/skills/orient/SKILL.md
.agent/skills/decide/SKILL.md
```

---

## Working Loop

Every serious development session should follow this loop:

```txt
orient / remember restore
  -> architect
  -> decide when durable choices are made
  -> execute
  -> imprint if UI changed
  -> review
  -> remember save
```

If something goes wrong:

```txt
recover
```

The loop matters more than speed.

An agent that plans, builds, reviews and saves state consistently will outperform an agent that writes code immediately.

---

## Agent Modes

Each mode has a different responsibility.

### Orient

Understand the current repository before acting.

Use when starting work in a project or returning after time away.

### Remember

Restore or save session continuity.

Use `remember restore` at the start of a session when `memory.md` exists.

Use `remember save` at the end of a session.

### Architect

Decide what should be built before implementation begins.

Architect mode must not write production code.

### Decide

Record important decisions permanently in `docs/DECISIONS.md`.

### Execute

Build from an approved blueprint.

Execute mode should not secretly redesign the feature.

### Imprint

Preserve UI consistency by writing visual patterns to `docs/UI_REGISTRY.md`.

### Review

Check whether the feature is correct before moving on.

Review mode reports issues. It does not fix them unless asked.

### Recover

Diagnose failures before attempting fixes.

The agent should not keep patching a failed approach if the foundation is wrong.

---

## Product Boundaries

PlanPal product boundaries are documented in `docs/`.

The agent must read relevant product docs before building features.

Important current docs include:

```txt
docs/MVP_0_PRODUCT_SPEC.md
docs/MVP_1_DATA_MODEL.md
docs/MVP_2_FIRESTORE_SCHEMA.md
docs/MVP_3_AI_ASSISTANT_SPEC.md
docs/SECURITY_BOUNDARIES.md
docs/DECISIONS.md
```

---

## Quality Gate

A feature is not done when it compiles.

A feature is done when it is correct enough to build on.

Before moving on, verify:

- it matches the agreed plan
- it respects the data model
- it does not expand scope silently
- it has basic error handling
- it has basic empty/loading states if UI is involved
- it respects documented boundaries
- it updates documentation where needed

---

## Session Start Protocol

At the start of a session, the agent should:

1. Read `memory.md` if it exists.
2. Read relevant docs.
3. Summarise current state.
4. Ask for confirmation before proceeding.

---

## Session End Protocol

At the end of a session, the agent should:

1. Save durable knowledge to docs if needed.
2. Save current handoff state to `memory.md`.
3. Summarise changed files.
4. State the exact next action.

---

## The Rule

Do not rely on memory alone.

Do not rely on chat alone.

Do not rely on the model being clever.

Rely on workflow, documentation, and small verified steps.
