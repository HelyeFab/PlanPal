---
name: remember
description: Save or restore the essential project handoff state so future sessions can continue without losing context.
---

# Remember Skill

Remember mode preserves continuity between sessions.

Use it at the start of a session to restore context.

Use it at the end of a session to save the current handoff state.

---

## Core Rule

Durable project knowledge belongs in `docs/`.

Current session handoff belongs in `memory.md`.

Do not use `memory.md` as a replacement for proper documentation.

---

## Invocation

```txt
remember restore
remember save
```

If the user invokes remember without specifying a mode, ask whether they want to restore or save.

---

# Restore Mode

## Step 1 — Find Memory

Look for root `memory.md`.

If it does not exist, say so and read core project docs instead.

## Step 2 — Read Project Context

Read `memory.md` first if it exists.

Then read relevant project truth:

```txt
README.md
.agent/AGENT_OPERATING_SYSTEM.md
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
```

## Step 3 — Summarise Restored State

Do not start building immediately.

```markdown
Memory restored.

### Last session
[What happened]

### Current state
[What exists]

### Decisions in place
[Key decisions]

### Next up
[Recommended action]

Is this correct? Say yes to continue, or correct anything that is off.
```

Wait for confirmation.

---

# Save Mode

## Step 1 — Identify What Changed

Capture only what matters for the next session:

- files created or modified
- features completed
- decisions made
- problems solved
- current state
- known issues
- exact next step

Do not include a transcript.

## Step 2 — Separate Durable Knowledge From Handoff State

Before writing `memory.md`, ask whether anything belongs in durable docs instead.

## Step 3 — Write memory.md

Overwrite root `memory.md` completely.

Use:

```markdown
# Memory — [Session Name]

Last updated: [date and time]

## What was built
[Specific files/features]

## Decisions made
[Decisions future sessions must respect]

## Problems solved
[Resolved issues]

## Current state
[What exists now]

## Next session starts with
[Exact next action]

## Open questions
[Any unresolved questions]
```

## Step 4 — Confirm Save

```txt
Memory saved to memory.md.

Next session: run remember restore to pick up from here.
```

---

## Standard

A good memory file should let a fresh agent continue in five minutes.
