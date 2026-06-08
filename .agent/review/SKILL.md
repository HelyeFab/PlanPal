---
name: review
description: Verify that a completed change matches the approved blueprint, respects project standards, and is ready to move forward.
---

# Review Skill

The review skill checks whether a completed change is correct.

Use this skill after execution and before moving on to the next feature.

A feature is not done because it compiles.

A feature is done when it matches the plan, respects the system, and is safe enough to continue building on.

---

## Core Rule

Review mode reports issues.

It does not fix them unless the user explicitly asks.

Do not blur review and execution.

---

## Step 1 — Establish the Benchmark

Before reviewing code, identify what the implementation should be judged against.

Read, where relevant:

```txt
approved implementation blueprint
README.md
memory.md
docs/AGENT_OPERATING_SYSTEM.md
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
docs/UI_REGISTRY.md
```

If no blueprint exists, ask the user what the feature was supposed to do before reviewing.

```txt
I need the intended behaviour before I can review this properly.
What was this change supposed to build?
```

Do not review against vibes.

Review against the plan.

---

## Step 2 — Identify Changed Files

Inspect the files changed by the implementation.

Focus on files touched by the feature, not the entire repository.

If the changed files are unclear, ask the user or inspect recent changes if tooling allows.

---

## Step 3 — Review Layer 1: Plan Alignment

Check whether the implementation matches the approved blueprint.

Ask:

- Was every planned item implemented?
- Did the implementation add anything not agreed?
- Did it skip any required behaviour?
- Did the naming match the agreed language?
- Did the scope stay contained?

Flag both missing work and unplanned extras.

Unplanned extras are not automatically bad, but they must be visible.

---

## Step 4 — Review Layer 2: System Integrity

Check whether the implementation respects the project.

Review:

### Architecture

- Are responsibilities in the correct files?
- Did server-only logic stay server-side?
- Did client code avoid secrets?
- Did database access remain in appropriate helpers or API routes?
- Did the implementation reuse existing patterns?

### Data model

- Does the code match documented data structures?
- Are field names consistent?
- Are required fields handled?
- Are empty or missing values handled safely?

### Documentation

- Did implementation change project behaviour in a way that should update docs?
- Did it contradict existing docs?
- Was a new decision made that belongs in `docs/DECISIONS.md`?

### UI consistency

If UI changed:

- Does it follow `docs/UI_REGISTRY.md` if present?
- Are colours, spacing, radius and typography consistent?
- Are hardcoded visual values avoided when tokens or existing classes exist?

---

## Step 5 — Review Layer 3: Production Readiness

Check whether the feature can survive real usage.

Review:

- loading states
- empty states
- error states
- invalid input
- missing data
- permissions or access assumptions
- obvious runtime failures
- console or build errors where available
- accessibility basics for UI work

Do not require enterprise-grade polish for an MVP.

Do require that obvious user-facing failure modes are handled deliberately.

---

## Step 6 — Classify Severity

Use severity labels.

### Critical

Must fix before moving on.

Examples:

- planned functionality missing
- architecture boundary violation that will block future work
- secrets exposed to client code
- data loss risk
- core flow broken

### Important

Should fix soon.

Examples:

- inconsistent data naming
- missing common empty state
- UI drift from registry
- weak error handling in likely path
- docs not updated after behaviour changed

### Minor

Can fix later.

Examples:

- small naming inconsistency
- harmless duplication
- non-blocking polish issue

---

## Step 7 — Produce the Review Report

Use this format:

```markdown
## Review — [Feature Name]

### Layer 1 — Plan alignment
[PASS / ISSUES FOUND]

- [Severity] [Issue]

### Layer 2 — System integrity
[PASS / ISSUES FOUND]

- [Severity] [Issue]

### Layer 3 — Production readiness
[PASS / ISSUES FOUND]

- [Severity] [Issue]

### Summary
[X] issues found across [Y] layers.

### Recommendation
[Ready to move on / Fix critical issues first / Fix listed issues before release]
```

If no issues are found, say:

```txt
No issues found. This change is ready to move forward.
```

---

## Step 8 — Stop

After reporting, stop.

Do not begin fixing.

Wait for the user to decide what to do next.

The user may:

- ask to fix a specific issue
- ignore an issue intentionally
- ask for a deeper review
- approve moving on

---

## What Review Mode Is Not

Review mode is not execution.

Review mode is not architecture planning.

Review mode is not a place to rewrite the feature.

Review mode is not a place to silently fix problems.

---

## Standard

The question is not:

> Does it work?

The question is:

> Is it correct enough to build on?

Working and correct are not the same thing.
