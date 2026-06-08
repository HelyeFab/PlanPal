---
name: imprint
description: Capture UI patterns after building components so future UI stays visually consistent.
---

# Imprint Skill

Imprint mode preserves visual consistency across the application.

Use it after building or modifying UI.

---

## Core Rule

If UI changes, imprint runs before the session moves on.

Build UI. Imprint patterns. Then review.

---

## Registry Location

Save UI patterns in:

```txt
docs/UI_REGISTRY.md
```

If this file does not exist, create it.

---

## Invocation

```txt
imprint
imprint [filepath]
imprint audit
```

---

# Standard Imprint Mode

## Step 1 — Identify What Was Built

If a filepath was provided, read that file.

If no filepath was provided, identify recent UI changes.

Likely UI locations:

```txt
app/
components/
src/components/
src/app/
apps/web/app/
apps/web/components/
```

If unclear, ask which UI file should be imprinted.

---

## Step 2 — Read Existing UI Registry

Read `docs/UI_REGISTRY.md` if it exists.

Update existing component entries instead of duplicating them.

---

## Step 3 — Extract Visual Patterns

Capture reusable visual choices:

- container background
- card/panel background
- border style and colour
- border radius
- shadow
- primary/secondary/muted text colours
- heading/body/label styles
- padding and gaps
- button styles
- hover/focus states
- accent usage
- disabled states

Do not capture one-off layout details, data labels or context-specific sizes.

---

## Step 4 — Write or Update Registry Entry

Use:

```markdown
### [Component or Pattern Name]

File: [filepath]
Last updated: [date]

| Property | Pattern |
| --- | --- |
| Background | [class/value] |
| Border | [class/value] |
| Radius | [class/value] |
| Shadow | [class/value or none] |
| Text primary | [class/value] |
| Text secondary | [class/value] |
| Text muted | [class/value] |
| Heading | [class/value] |
| Body text | [class/value] |
| Spacing | [class/value] |
| Interactive state | [class/value] |
| Accent usage | [class/value or none] |

**Pattern notes:**
[How future components should match this pattern.]
```

---

## Audit Mode

Use audit mode to establish or repair the baseline.

Scan UI files, identify conflicts, recommend a baseline, then wait for user confirmation before writing it.

---

## Standard

Consistency is a habit, not a feature.

If UI changed, imprint it.
