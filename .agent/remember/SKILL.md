---
name: remember
description: Save or restore the essential project handoff state so future sessions can continue without losing context.
---

# Remember Skill

The remember skill preserves continuity between sessions.

Use it at the start of a session to restore context.

Use it at the end of a session to save the current handoff state.

The goal is not to store a transcript.

The goal is to store exactly what a capable developer needs to continue from a fresh session.

---

## Core Rule

Durable project knowledge belongs in `docs/`.

Current session handoff belongs in `memory.md`.

Do not use `memory.md` as a replacement for proper documentation.

---

## Invocation

Use one of these modes:

```txt
remember restore
remember save
```

If the user invokes remember without specifying a mode, ask:

```txt
Do you want to restore memory or save the current session?
```

---

# Restore Mode

Use restore mode at the start of a session.

---

## Step 1 — Find Memory

Look for root `memory.md`.

If it does not exist, say:

```txt
No memory.md found.

Either this is the first session, or memory was not saved last time.
```

Then read the core project docs instead.

---

## Step 2 — Read Project Context

Read `memory.md` first if it exists.

Then read relevant project truth, usually:

```txt
README.md
docs/AGENT_OPERATING_SYSTEM.md
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
```

Read feature docs only when relevant to the work requested.

---

## Step 3 — Summarise Restored State

Do not start building immediately.

Summarise what was restored:

```markdown
Memory restored.

### Last session
[What happened last time]

### Current state
[What works, what exists, what is partial]

### Decisions in place
[Key decisions]

### Next up
[The next recommended action]

Is this correct? Say yes to continue, or correct anything that is off.
```

Wait for confirmation before continuing.

---

## If Memory Is Incomplete

If `memory.md` exists but is vague or outdated, say so.

```txt
I found memory.md, but some context seems missing:

- [gap]
- [gap]

Should we continue with what exists, or fill in the gaps first?
```

Do not guess important missing information.

---

# Save Mode

Use save mode at the end of a session.

---

## Step 1 — Identify What Changed

Capture only what matters for the next session.

Include:

- files created or modified
- features completed
- decisions made
- problems solved
- current state
- known issues
- exact next step

Do not include:

- a full transcript
- every minor step
- implementation details visible in the code
- decisions already fully documented elsewhere unless they affect next steps

---

## Step 2 — Separate Durable Knowledge From Handoff State

Before writing `memory.md`, ask whether any information belongs in durable docs instead.

Examples:

- Product rules belong in `docs/`.
- Architecture decisions belong in `docs/DECISIONS.md`.
- UI patterns belong in `docs/UI_REGISTRY.md`.
- Security assumptions belong in `docs/SECURITY_BOUNDARIES.md`.
- Session progress belongs in `memory.md`.

If durable docs need updating, update or flag them before saving memory.

---

## Step 3 — Write memory.md

Overwrite root `memory.md` completely.

Do not append.

`memory.md` should always represent the latest handoff state.

Use this format:

```markdown
# Memory — [Session Name]

Last updated: [date and time]

## What was built

[Specific files, features, docs, or components completed this session]

## Decisions made

[Decisions future sessions must respect]

## Problems solved

[Issues resolved so they are not rediscovered]

## Current state

[What exists now, what works, what is partial, what is not started]

## Next session starts with

[The exact next action]

## Open questions

[Anything unresolved]
```

---

## Step 4 — Confirm Save

After writing `memory.md`, say:

```txt
Memory saved to memory.md.

Next session: run remember restore to pick up from here.
```

Also list the next starting action.

---

## What Remember Mode Is Not

Remember mode is not project documentation.

Remember mode is not a transcript.

Remember mode is not a substitute for code review.

Remember mode is not a place to continue building.

---

## Standard

A good memory file should let a fresh agent continue in five minutes.

If the next agent would still need to read the whole chat, the memory is not good enough.
