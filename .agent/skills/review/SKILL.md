---
name: review
description: Verify that a completed change matches the approved blueprint, respects project standards, and is ready to move forward.
---

# Review Skill

Review mode checks whether a completed change is correct.

Use it after execution and before moving on.

A feature is not done because it compiles. A feature is done when it matches the plan, respects the system, and is safe enough to build on.

---

## Core Rule

Review mode reports issues.

It does not fix them unless the user explicitly asks.

---

## Step 1 — Establish the Benchmark

Read, where relevant:

```txt
approved implementation blueprint
README.md
memory.md
.agent/AGENT_OPERATING_SYSTEM.md
docs/DECISIONS.md
docs/CODING_STANDARDS.md
docs/SECURITY_BOUNDARIES.md
docs/UI_REGISTRY.md
```

If no blueprint exists, ask what the feature was supposed to do.

Do not review against vibes. Review against the plan.

---

## Step 2 — Identify Changed Files

Inspect files changed by the implementation.

Focus on files touched by the feature, not the entire repository.

---

## Step 3 — Review Layer 1: Plan Alignment

Check:

- Was every planned item implemented?
- Did implementation add anything not agreed?
- Did it skip required behaviour?
- Did naming match agreed language?
- Did scope stay contained?

---

## Step 4 — Review Layer 2: System Integrity

Check architecture, data model, documentation and UI consistency.

### Architecture

- Responsibilities in correct files?
- Server-only logic server-side?
- Client code avoids secrets?
- Existing patterns reused?

### Data model

- Matches documented structures?
- Field names consistent?
- Required fields handled?

### Documentation

- Docs updated when behaviour changed?
- New decisions recorded if needed?

### UI consistency

If UI changed:

- Follows `docs/UI_REGISTRY.md`?
- Colours, spacing, radius and typography consistent?

---

## Step 5 — Review Layer 3: Production Readiness

Check:

- loading states
- empty states
- error states
- invalid input
- missing data
- permission assumptions
- obvious runtime failures
- accessibility basics for UI work

---

## Step 6 — Classify Severity

Use:

```txt
Critical — must fix before moving on
Important — should fix soon
Minor — can fix later
```

---

## Step 7 — Produce Report

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

If no issues:

```txt
No issues found. This change is ready to move forward.
```

---

## Step 8 — Stop

After reporting, stop. Wait for the user to decide.

---

## Standard

The question is not "does it work?".

The question is "is it correct enough to build on?".
