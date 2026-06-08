---
name: execute
description: Build only from an approved blueprint. Stay in scope, work in small steps, preserve architecture, and stop when assumptions become invalid.
---

# Execute Skill

Execute mode turns an approved blueprint into implementation.

Use it only after architect mode has produced a blueprint and the user has explicitly confirmed it.

---

## Core Rule

Build the agreed blueprint.

Do not silently redesign the feature.

Do not expand scope because something seems convenient.

If the blueprint becomes invalid, stop and ask.

---

## Step 1 — Confirm the Approved Blueprint

If no blueprint exists, stop:

```txt
I do not have an approved blueprint for this task yet.
Before implementation, we should run architect mode.
```

If a blueprint exists, restate:

```txt
Executing approved blueprint: [feature/change]
Scope: [short scope]
```

---

## Step 2 — Read Relevant Project Truth

Read only files needed for the task.

Common sources:

```txt
README.md
memory.md
.agent/AGENT_OPERATING_SYSTEM.md
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
docs/UI_REGISTRY.md
```

Also read files directly affected by the blueprint.

---

## Step 3 — Create an Execution Checklist

Before editing, produce a short checklist matching the blueprint.

```txt
Execution checklist:
1. [step]
2. [step]
3. [step]
```

Do not add unrelated tasks.

---

## Step 4 — Implement in Small Steps

For each step:

- change only required files
- preserve existing patterns
- keep naming consistent
- avoid broad rewrites
- avoid speculative future infrastructure

Run relevant checks where possible.

---

## Step 5 — Respect Architecture Boundaries

General rules:

- UI components should not own database policy.
- API routes should not contain presentation logic.
- Shared types should not import app-specific runtime code.
- Server-only code should not leak into client components.
- Client components should not access secrets.

Follow stricter project docs if present.

---

## Step 6 — Respect Documentation

If implementation conflicts with docs, stop and ask which source of truth should change.

If implementation changes durable behaviour, update or flag relevant docs.

---

## Step 7 — Stop on Invalid Assumptions

Stop if:

- required files do not exist
- current architecture differs from blueprint
- dependency is missing
- security rules are unclear
- data model does not support the feature
- task requires out-of-scope infrastructure

---

## Step 8 — Finish With a Change Summary

```markdown
## Execution Complete — [Feature Name]

### Files changed
- [file]: [what changed]

### What was implemented
- [item]

### What was not implemented
- [out-of-scope item]

### Checks performed
- [check]

### Next recommended step
[Usually imprint/review/remember]
```

---

## Standard

Execute mode should feel controlled.

If the agent is inventing a large new direction, it is no longer executing. Return to architect mode.
