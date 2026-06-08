---
name: orient
description: Cold-start a session by reading the repository, understanding the current project state, and summarising it before taking action.
---

# Orient Skill

The orient skill is used when starting work in a project, returning after time away, or handing the repository to a fresh agent.

Its job is to understand the current state of the project before planning, coding, reviewing, or fixing anything.

Orient mode prevents the agent from acting from stale chat memory or assumptions.

---

## Core Rule

Read first.

Summarise second.

Act only after confirmation.

Do not modify files in orient mode.

---

## When To Use

Use orient mode when:

- starting a new session
- joining an unfamiliar project
- returning after several sessions
- switching from planning to real implementation
- the user asks what the project state is
- the agent is unsure which docs are current
- memory is missing or unreliable

If `memory.md` exists and the user specifically wants continuity from the last session, use remember restore first, then orient if broader repo context is needed.

---

## Step 1 — Identify the Repository Context

Confirm the repository being used.

If the repo is unclear, ask:

```txt
Which repository should I orient myself in?
```

If the repo is known, continue.

---

## Step 2 — Read Core Project Truth

Read available files in this order:

```txt
README.md
memory.md
docs/AGENT_OPERATING_SYSTEM.md
docs/DECISIONS.md
docs/MVP_0_PRODUCT_SPEC.md
docs/MVP_1_DATA_MODEL.md
docs/MVP_2_FIRESTORE_SCHEMA.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
docs/UI_REGISTRY.md
docs/ROADMAP.md
```

Not all files will exist.

Do not fail because a file is missing.

List missing important files in the final orientation summary.

---

## Step 3 — Inspect the Project Shape

Inspect the top-level repository structure.

Look for:

```txt
app/
src/
components/
lib/
packages/
apps/
public/
.agent/
docs/
package.json
next.config.*
tsconfig.json
firebase.*
```

The goal is to understand the shape of the project, not review every file.

Do not deeply inspect implementation files unless the user asks or the docs are unclear.

---

## Step 4 — Identify Current Stage

Classify the project stage.

Examples:

```txt
Documentation-only foundation
App scaffold exists but no feature implementation
MVP shell exists
Core data model implemented
UI prototype exists
Production app in active development
```

Be honest.

Do not overstate maturity.

---

## Step 5 — Identify Current Source of Truth

State which files appear authoritative.

Example:

```txt
The current source of truth appears to be:

- README.md for project positioning
- docs/AGENT_OPERATING_SYSTEM.md for agent workflow
- docs/MVP_1_DATA_MODEL.md for domain model
- docs/MVP_2_FIRESTORE_SCHEMA.md for Firestore structure
```

If docs conflict, flag the conflict.

---

## Step 6 — Summarise Orientation

Produce a concise orientation report.

Use this format:

```markdown
## Orientation Report

### Repository
[repo name]

### Current project stage
[stage]

### What exists
- [file/area]: [purpose]
- [file/area]: [purpose]

### Source of truth
- [doc]: [what it governs]

### Current architecture direction
[Short summary]

### Agent workflow in place
[Which .agent skills exist]

### Missing or not yet created
- [missing file/area]
- [missing file/area]

### Risks or ambiguities
- [risk]
- [ambiguity]

### Recommended next step
[one concrete next action]
```

---

## Step 7 — Wait For Confirmation

After the orientation report, stop.

Ask:

```txt
Is this orientation correct?
```

Do not begin architect, execute, recover, or review mode until the user confirms or corrects the orientation.

---

## What Orient Mode Is Not

Orient mode is not implementation.

Orient mode is not review.

Orient mode is not planning a feature.

Orient mode is not memory save.

Orient mode is not a full audit.

---

## Standard

A good orientation lets the user say:

> Yes, you understand the project.

Only then should the agent start making decisions or changes.
