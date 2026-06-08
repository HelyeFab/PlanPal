---
name: recover
description: Diagnose what kind of failure occurred before deciding whether to patch, reset, or rethink.
---

# Recover Skill

Recover mode is used when something goes wrong during development.

Its purpose is to stop the agent from blindly applying patch after patch until the project becomes worse.

---

## Core Rule

Do not fix before diagnosing.

First identify the failure mode. Then choose the correct response.

---

## Step 1 — Ask What Went Wrong

If the user has not already explained the problem, ask:

```txt
Describe what went wrong:

- What did you expect to happen?
- What happened instead?
- What changed most recently?
- How many times has this already been patched?
```

---

## Step 2 — Read Only Relevant Context

Read files directly related to the failure.

Useful context may include:

```txt
approved blueprint
recently changed files
error output
README.md
memory.md
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
```

---

## Step 3 — Classify the Failure Mode

### Failure Mode 1 — Local Bug

Signs:

- one specific thing is broken
- error is clear
- first or second fix attempt

Response: targeted fix.

### Failure Mode 2 — Polluted Session

Signs:

- several patches made things worse
- original problem is unclear
- code contains patches on patches

Response: hard reset.

### Failure Mode 3 — Wrong Foundation

Signs:

- implementation misunderstood a core requirement
- wrong data shape or architecture was chosen
- fixing pieces will not solve it

Response: rethink and return to architect mode.

### Failure Mode 4 — Environment or Dependency Issue

Signs:

- tooling fails
- dependency versions conflict
- environment variables missing
- local and deployed behaviour differ

Response: environment diagnosis.

### Failure Mode 5 — Data or Permission Mismatch

Signs:

- mocked data works but real data fails
- access rules deny expected operations
- document paths do not match schema

Response: data path and permission audit.

---

## Step 4 — State the Diagnosis

```txt
This looks like Failure Mode [number] — [name].

Why: [brief explanation]

Recommended response: [targeted fix / hard reset / rethink / environment diagnosis / data audit]
```

Do not proceed silently.

---

## Step 5 — Respond Correctly

### Targeted Fix

State root cause before editing.

```txt
Root cause: [specific cause]
Fix: [specific change]
```

If the first fix fails, re-check the diagnosis.

### Hard Reset

Create a reset note:

```markdown
## Reset Note — [Feature Name]

### What we were building
[Original goal]

### What went wrong
[How the session became tangled]

### What can be kept
[Valid parts]

### What should be discarded
[Invalid parts]

### Clean starting point
[Where to begin]
```

Then stop.

### Rethink

Name the wrong assumption and return to architect mode.

### Environment Diagnosis

Check setup before app code.

### Data and Permission Audit

Check documented paths, actual paths, required fields and access assumptions.

---

## Standard

The worst response to a broken build is speed.

Slow down, classify the failure, then act.
