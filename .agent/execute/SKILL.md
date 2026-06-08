---
name: execute
description: Build only from an approved blueprint. Stay in scope, work in small steps, preserve architecture, and stop when assumptions become invalid.
---

# Execute Skill

The execute skill turns an approved blueprint into implementation.

Use this skill after architect mode has produced a blueprint and the user has explicitly confirmed it.

Execute mode is where files may be created or changed.

---

## Core Rule

Build the agreed blueprint.

Do not silently redesign the feature.

Do not expand scope because something seems convenient.

If the blueprint becomes invalid, stop and ask.

---

## Step 1 — Confirm the Approved Blueprint

Before changing files, identify the blueprint being executed.

If no blueprint exists, stop and ask the user to run architect mode first.

```txt
I do not have an approved blueprint for this task yet.
Before implementation, we should run architect mode.
```

If a blueprint exists, restate the execution target briefly:

```txt
Executing approved blueprint: [feature/change]
Scope: [short scope]
```

---

## Step 2 — Read Relevant Project Truth

Read only the files needed for the task.

Common sources:

```txt
README.md
memory.md
docs/AGENT_OPERATING_SYSTEM.md
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
docs/UI_REGISTRY.md
```

Also read any files directly affected by the blueprint.

Do not scan the whole project unless the task requires it.

---

## Step 3 — Create a Small Execution Checklist

Before editing, produce a short checklist.

Example:

```txt
Execution checklist:
1. Create shared types.
2. Add Firestore helper.
3. Build page shell.
4. Add empty state.
5. Run review.
```

The checklist should reflect the approved blueprint.

Do not add unrelated tasks.

---

## Step 4 — Implement in Small Steps

Work in small, understandable changes.

Prefer simple implementation over clever abstraction.

For each step:

- change only the files required
- preserve existing patterns
- keep naming consistent
- avoid broad rewrites
- avoid speculative future infrastructure

If the project has tests or checks, run the relevant ones when possible.

---

## Step 5 — Respect Architecture Boundaries

Do not mix responsibilities.

General rules:

- UI components should not own database policy.
- API routes should not contain presentation logic.
- Shared types should not import app-specific runtime code.
- Server-only code should not leak into client components.
- Client components should not access secrets.

If the project defines stricter boundaries in docs, follow those instead.

---

## Step 6 — Respect Documentation

If implementation reveals that a documented assumption is wrong, stop.

Do not quietly implement something different from the docs.

Say:

```txt
The blueprint conflicts with the current project documentation:

- Blueprint says: [x]
- Existing docs/code say: [y]

We need to decide which source of truth should change before I continue.
```

If implementation changes a durable project decision, update the relevant docs or flag that the docs need updating.

---

## Step 7 — Stop on Invalid Assumptions

Stop if:

- required files do not exist
- the current architecture differs from the blueprint
- a dependency is missing
- security rules are unclear
- the data model does not support the feature
- the task would require adding out-of-scope infrastructure

Do not improvise a major architectural workaround without confirmation.

---

## Step 8 — Keep the User Informed

For small tasks, complete the work and summarise.

For larger tasks, report progress at natural checkpoints.

Do not narrate every keystroke.

Good progress update:

```txt
Completed the shared types and Firestore helper.
Next I am building the page shell.
```

Bad progress update:

```txt
Now I am opening file X. Now I am editing line Y.
```

---

## Step 9 — Finish With a Change Summary

When execution is complete, summarise:

```markdown
## Execution Complete — [Feature Name]

### Files changed
- [file]: [what changed]
- [file]: [what changed]

### What was implemented
- [item]
- [item]

### What was not implemented
- [out-of-scope item]

### Checks performed
- [check]

### Next recommended step
[Usually review mode]
```

If UI changed, recommend imprint mode.

If a feature was built, recommend review mode.

If session is ending, recommend remember save.

---

## What Execute Mode Is Not

Execute mode is not planning.

Execute mode is not a place to reopen settled decisions.

Execute mode is not an excuse to build extra features.

Execute mode is not review mode.

---

## Standard

Execute mode should feel controlled.

If the agent is inventing large new direction during execution, it is no longer executing.

It should stop and return to architect mode.
