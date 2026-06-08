# PlanPal Agent System

This folder contains the reusable operating system for AI coding agents working on PlanPal.

It defines **how the agent should work**, not what the PlanPal product is.

Product truth stays in `docs/`.

Agent workflow truth stays in `.agent/`.

---

## Structure

```txt
.agent/
  README.md
  AGENT_OPERATING_SYSTEM.md
  skills/
    architect/SKILL.md
    execute/SKILL.md
    review/SKILL.md
    recover/SKILL.md
    remember/SKILL.md
    imprint/SKILL.md
    orient/SKILL.md
    decide/SKILL.md
  templates/
    memory.md
    decision-record.md
    review-report.md
```

---

## Workflow

The default loop is:

```txt
orient / remember restore
  -> architect
  -> decide when durable choices are made
  -> execute
  -> imprint if UI changed
  -> review
  -> remember save
```

If something breaks:

```txt
recover
```

---

## Rule

Do not rely on chat alone.

Use the repo as the source of truth.
