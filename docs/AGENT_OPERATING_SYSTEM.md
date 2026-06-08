# PlanPal Agent Operating System

Version: 0.1
Status: Draft

## Purpose

This document defines how an AI coding agent should work on PlanPal.

The goal is to make the agent behave like a disciplined engineering partner, not like a random code generator.

PlanPal should be built and maintained through a repeatable workflow that preserves context, prevents scope drift, protects architectural decisions, and keeps the product safe and coherent over time.

---

## Core Principle

Chat is the workshop.

GitHub is the source of truth.

Important project knowledge must be saved in the repository, not left only in conversation history.

---

## Source of Truth

The agent should treat the following files and locations as authoritative.

```txt
README.md
memory.md
docs/
.agent/
```

### Durable project truth

Durable knowledge belongs in `docs/`.

Examples:

```txt
docs/MVP_0_PRODUCT_SPEC.md
docs/MVP_1_DATA_MODEL.md
docs/MVP_2_FIRESTORE_SCHEMA.md
docs/AGENT_OPERATING_SYSTEM.md
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
.agent/architect/SKILL.md
.agent/execute/SKILL.md
.agent/review/SKILL.md
.agent/recover/SKILL.md
.agent/remember/SKILL.md
.agent/imprint/SKILL.md
.agent/orient/SKILL.md
.agent/decide/SKILL.md
```

---

## The Working Loop

Every serious development session should follow this loop.

```txt
orient / remember restore
  -> architect
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

The agent must know which mode it is in.

Each mode has a different responsibility.

### Orient

Purpose:

> Understand the current repository before acting.

Use when starting work in a project or after returning to it later.

The agent should read core docs, current repo structure and memory state, then summarise what it understands before taking action.

---

### Remember

Purpose:

> Restore or save session continuity.

Use `remember restore` at the start of a session when `memory.md` exists.

Use `remember save` at the end of a session.

Memory should capture:

- files changed
- decisions made
- current state
- known problems
- next step

Memory should not be a transcript.

---

### Architect

Purpose:

> Decide what should be built before implementation begins.

The agent should:

- read relevant docs first
- align vocabulary
- surface only decisions that change implementation
- produce an implementation blueprint
- wait for explicit confirmation before coding

Architect mode must not write production code.

---

### Execute

Purpose:

> Build from an approved blueprint.

The agent should:

- stay within the agreed scope
- work in small steps
- preserve existing architecture
- update docs if implementation changes the plan
- stop if a major assumption becomes invalid

Execute mode should not secretly redesign the feature.

---

### Imprint

Purpose:

> Preserve UI consistency.

Run after building or modifying UI.

The agent should extract reusable visual patterns and save them to `docs/UI_REGISTRY.md`.

This prevents spacing, colours, text sizes, border radius and component patterns from drifting over time.

---

### Review

Purpose:

> Check whether the feature is correct before moving on.

The agent should review in layers:

1. Does the implementation match the blueprint?
2. Does it respect the project architecture?
3. Does it respect the design system?
4. Does it handle loading, empty and error states?
5. Is it safe enough for the product domain?

Review mode reports issues. It does not fix them unless asked.

---

### Recover

Purpose:

> Diagnose failures before attempting fixes.

The agent should classify problems before touching code.

Common failure types:

- local bug
- polluted session
- wrong foundation
- external dependency issue
- data/model mismatch
- security boundary confusion

The agent should not keep patching a failed approach if the foundation is wrong.

---

### Decide

Purpose:

> Record important decisions permanently.

Important product, architecture and workflow choices should be saved in `docs/DECISIONS.md`.

A decision record should explain:

- decision
- reason
- implications
- date

This prevents future sessions from reopening settled choices unnecessarily.

---

## PlanPal-Specific Product Boundaries

PlanPal is not a generic diet generator.

PlanPal helps a client follow a plan created by a professional.

The agent must preserve this boundary in product, data model and assistant behaviour.

The assistant should reason from the active plan and professional-approved options. It should not invent a new plan.

---

## PlanPal-Specific Engineering Boundaries

For the MVP, the expected stack is:

```txt
Next.js PWA
Firebase Auth
Firestore
OpenAI API
Vercel
```

The current MVP should avoid:

- native mobile app structure
- billing
- white-label infrastructure
- clinic hierarchy
- barcode scanning
- wearable integration
- broad food database complexity
```

These ideas may appear in the roadmap, but should not contaminate the MVP.

---

## Project Documents to Add

The following documents should be created as the system matures.

```txt
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
docs/UI_REGISTRY.md
docs/MVP_3_AI_ASSISTANT_SPEC.md
```

---

## Quality Gate

A feature is not done when it compiles.

A feature is done when it is correct.

Before moving on, the agent should verify:

- it matches the agreed plan
- it respects the data model
- it does not expand scope silently
- it has basic error handling
- it has basic empty/loading states if UI is involved
- it does not violate product safety boundaries
- it updates documentation where needed

---

## Session Start Protocol

At the start of a session, the agent should:

1. Read `memory.md` if it exists.
2. Read relevant docs.
3. Summarise current state.
4. Ask for confirmation before proceeding.

The agent should not assume the user wants to continue immediately without confirming the restored state.

---

## Session End Protocol

At the end of a session, the agent should:

1. Save important durable knowledge to docs if needed.
2. Save current handoff state to `memory.md`.
3. Summarise changed files.
4. State the exact next action.

---

## The Rule

Do not rely on memory alone.

Do not rely on chat alone.

Do not rely on the model being clever.

Rely on workflow, documentation, and small verified steps.
