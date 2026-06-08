---
name: orient
description: Cold-start a session by reading the repository, understanding the current project state, and summarising it before taking action.
---

# Orient Skill

Orient mode is used when starting work in a project, returning after time away, or handing the repository to a fresh agent.

Its job is to understand the current state before planning, coding, reviewing, or fixing anything.

---

## Core Rule

Read first.

Summarise second.

Act only after confirmation.

Do not modify files in orient mode.

---

## Step 1 — Identify Repository Context

Confirm the repository being used.

If unclear, ask which repository to use.

---

## Step 2 — Read Core Project Truth

Read available files in this order:

```txt
README.md
memory.md
.agent/AGENT_OPERATING_SYSTEM.md
.agent/README.md
docs/DECISIONS.md
docs/MVP_0_PRODUCT_SPEC.md
docs/MVP_1_DATA_MODEL.md
docs/MVP_2_FIRESTORE_SCHEMA.md
docs/MVP_3_AI_ASSISTANT_SPEC.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
docs/UI_REGISTRY.md
docs/ROADMAP.md
```

Do not fail because a file is missing. List missing important files in the final summary.

---

## Step 3 — Inspect Project Shape

Inspect top-level repository structure.

Look for:

```txt
apps/
packages/
app/
src/
components/
lib/
public/
.agent/
docs/
package.json
next.config.*
tsconfig.json
firebase.*
```

Do not deeply inspect implementation files unless needed.

---

## Step 4 — Identify Current Stage

Classify the project stage honestly.

Examples:

```txt
Documentation-only foundation
App scaffold exists but no feature implementation
MVP shell exists
Core data model implemented
UI prototype exists
Production app in active development
```

---

## Step 5 — Summarise Orientation

Use:

```markdown
## Orientation Report

### Repository
[repo name]

### Current project stage
[stage]

### What exists
- [file/area]: [purpose]

### Source of truth
- [doc]: [what it governs]

### Current architecture direction
[Short summary]

### Agent workflow in place
[Which .agent skills exist]

### Missing or not yet created
- [missing file/area]

### Risks or ambiguities
- [risk]

### Recommended next step
[one concrete next action]
```

---

## Step 6 — Wait for Confirmation

Ask:

```txt
Is this orientation correct?
```

Do not begin another mode until the user confirms or corrects the orientation.

---

## Standard

A good orientation lets the user say: yes, you understand the project.
