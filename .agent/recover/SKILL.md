---
name: recover
description: Diagnose what kind of failure occurred before deciding whether to patch, reset, or rethink.
---

# Recover Skill

The recover skill is used when something goes wrong during development.

Its purpose is to stop the agent from blindly applying patch after patch until the project becomes worse.

Not every problem is a bug.

Not every bug needs the same response.

Recover mode diagnoses first, then chooses the right recovery strategy.

---

## Core Rule

Do not fix before diagnosing.

The first job is to identify the failure mode.

Only after the failure mode is clear should the agent recommend a response.

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

The number of previous fix attempts matters.

A first failure may be a normal bug.

A fifth failed patch may mean the session itself is damaged.

---

## Step 2 — Read Only Relevant Context

Read the files directly related to the failure.

Do not scan the entire repository unless the problem is architectural or widespread.

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

Classify the problem before proposing a fix.

### Failure Mode 1 — Local Bug

Signs:

- one specific thing is broken
- the rest of the feature mostly works
- the error is clear
- this is the first or second fix attempt
- the root cause can likely be isolated

Response:

> Targeted fix.

---

### Failure Mode 2 — Polluted Session

Signs:

- several patches have made things worse
- the original problem is no longer clear
- code now contains patches on top of patches
- new bugs appear after every fix
- the conversation context is full of failed attempts

Response:

> Hard reset.

This does not necessarily mean deleting the project.

It means stopping the current repair path and creating a clean reset note.

---

### Failure Mode 3 — Wrong Foundation

Signs:

- the code runs but does the wrong thing conceptually
- the implementation misunderstood a core requirement
- the wrong data shape or architecture was chosen
- fixing individual pieces will not solve the problem
- the feature was built on a false assumption

Response:

> Rethink.

Return to architect mode before rebuilding.

---

### Failure Mode 4 — Environment or Dependency Issue

Signs:

- the code appears correct but tooling fails
- dependency versions conflict
- environment variables are missing
- local and deployed behaviour differ
- install, build or runtime setup is broken

Response:

> Environment diagnosis.

Do not rewrite app code until the environment issue is confirmed or ruled out.

---

### Failure Mode 5 — Data or Permission Mismatch

Signs:

- the UI works with mocked data but not real data
- reads or writes fail silently
- access rules deny expected operations
- document paths do not match the documented schema
- fields expected by the UI are missing from stored data

Response:

> Data path and permission audit.

Check schema, access assumptions and sample documents before changing UI code.

---

## Step 4 — State the Diagnosis

Tell the user which failure mode this appears to be.

Use this format:

```txt
This looks like Failure Mode [number] — [name].

Why: [brief explanation]

Recommended response: [targeted fix / hard reset / rethink / environment diagnosis / data audit]
```

Do not proceed silently.

---

## Step 5A — Targeted Fix

Use for Failure Mode 1.

Identify the root cause before editing.

```txt
Root cause: [specific cause]

This is different from the symptom because [explanation].
```

Then propose the fix:

```txt
Fix: [specific change]

This should resolve the root cause because [reason].
```

Wait for confirmation if the fix is not trivial.

If the first targeted fix fails, re-check the diagnosis.

Do not keep stacking fixes.

---

## Step 5B — Hard Reset

Use for Failure Mode 2.

Do not keep patching.

Create a reset note:

```markdown
## Reset Note — [Feature Name]

### What we were building
[Original goal]

### What went wrong
[How the session became tangled]

### What can be kept
[Files, decisions or patterns that are still valid]

### What should be discarded
[Broken approach, files or assumptions]

### What to avoid next time
[Specific failed approaches]

### Clean starting point
[Where the next session should begin]
```

Recommend saving the reset note to the repo if useful.

Then stop.

A hard reset means the next useful step is a cleaner session or a return to architect mode.

---

## Step 5C — Rethink

Use for Failure Mode 3.

Name the wrong assumption.

```txt
The core issue is not a bug. It is a wrong assumption.

Assumed: [assumption]
Reality: [actual situation]
```

Then propose the correct direction:

```txt
Correct approach: [new approach]

What can be kept: [valid parts]
What should be discarded: [invalid parts]
```

Do not rebuild immediately.

Return to architect mode and create a new blueprint.

---

## Step 5D — Environment Diagnosis

Use for Failure Mode 4.

Check setup before changing application logic.

Possible checks:

- package install status
- dependency versions
- build command
- dev command
- environment variables
- deployment settings
- framework version compatibility

State whether the issue is confirmed as environment-related or whether it should be reclassified.

---

## Step 5E — Data and Permission Audit

Use for Failure Mode 5.

Check:

- documented data paths
- actual paths used in code
- required fields
- example documents
- access rules
- authenticated user assumptions

Do not patch UI state if the real issue is a data path mismatch.

---

## Step 6 — If Diagnosis Changes, Say So

Sometimes the first diagnosis is wrong.

If new evidence changes the failure mode, say so clearly:

```txt
I am reclassifying this.

I first thought this was [old mode], but the evidence points to [new mode] because [reason].
```

Then follow the new mode.

---

## What Recover Mode Is Not

Recover mode is not normal implementation.

Recover mode is not a place to rush fixes.

Recover mode is not a place to rewrite the whole feature without diagnosis.

Recover mode is not review mode.

---

## Standard

The worst response to a broken build is speed.

Slow down, classify the failure, then act.
