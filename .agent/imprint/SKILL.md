---
name: imprint
description: Capture UI patterns after building components so future UI stays visually consistent.
---

# Imprint Skill

The imprint skill preserves visual consistency across the application.

Use it after building or modifying any UI component, page, layout, form, card, button, modal, navigation element, or interactive visual state.

The goal is to prevent UI drift.

AI-built interfaces often become inconsistent because every component is built in isolation. Imprint creates a visual memory so future components can match what already exists.

---

## Core Rule

If UI changes, imprint runs before the session moves on.

Build UI.

Imprint patterns.

Then review.

---

## Registry Location

Save UI patterns in:

```txt
docs/UI_REGISTRY.md
```

If this file does not exist, create it.

Do not save UI registry entries in chat only.

---

## Invocation

Use one of these modes:

```txt
imprint
imprint [filepath]
imprint audit
```

### imprint

Automatically identify recently created or modified UI files and capture patterns.

### imprint [filepath]

Capture patterns from a specific component or page.

### imprint audit

Scan the existing UI and establish or update a baseline.

Use audit mode when:

- the project already has UI but no registry
- several sessions passed without imprinting
- the interface looks inconsistent
- a new design baseline is needed

---

# Standard Imprint Mode

## Step 1 — Identify What Was Built

If a filepath was provided, read that file.

If no filepath was provided, identify recent UI changes.

Likely UI locations include:

```txt
app/
components/
src/components/
src/app/
```

If it is unclear what to capture, ask:

```txt
Which UI file should I imprint?
```

Do not guess if the wrong file could pollute the registry.

---

## Step 2 — Read Existing UI Registry

Before writing a new entry, read `docs/UI_REGISTRY.md` if it exists.

Check whether the component type already has a pattern.

If it does, update the existing entry rather than duplicating it.

---

## Step 3 — Extract Visual Patterns

Extract only reusable visual choices.

Capture:

- container background
- card or panel background
- border style and colour
- border radius
- shadow
- primary text colour
- secondary text colour
- muted text colour
- heading size and weight
- body text size
- label or caption text style
- internal padding
- gap between elements
- button styles
- hover states
- focus states
- accent colour usage
- disabled states if present

Do not capture:

- width and height unless they are part of a reusable component rule
- flex/grid structure unless it defines a reusable pattern
- absolute positioning
- z-index
- one-off responsive values
- content-specific spacing
- data-specific labels or text

---

## Step 4 — Write or Update Registry Entry

Use this format:

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
[Short notes explaining how future components should match this pattern.]
```

If the component introduces a new pattern, mark it as new.

If the component deviates from the existing registry, flag the deviation before writing.

---

## Step 5 — Confirm Capture

After saving, report:

```txt
Imprinted [Component or Pattern Name] to docs/UI_REGISTRY.md.

Captured:
- Background: [pattern]
- Border: [pattern]
- Radius: [pattern]
- Text: [pattern]
- Spacing: [pattern]
- Interactive states: [pattern]
```

If anything looked inconsistent, add:

```txt
Note: [specific inconsistency]
```

---

# Audit Mode

Use audit mode to establish or repair the baseline.

## Step 1 — Scan UI Files

Find all UI files in likely UI directories.

Read enough to identify visual patterns.

Do not review business logic.

---

## Step 2 — Identify Conflicts

Report variations across key visual properties:

```markdown
## UI Consistency Audit

### Conflicts found

#### Border radius
- [variant]: [files]
Recommendation: [standard]

#### Backgrounds
- [variant]: [files]
Recommendation: [standard]

#### Borders
- [variant]: [files]
Recommendation: [standard]

#### Text colours
- [variant]: [files]
Recommendation: [standard]

#### Spacing
- [variant]: [files]
Recommendation: [standard]

#### Interactive states
- [variant]: [files]
Recommendation: [standard]

### Hardcoded values found
- [file]: [value]

### Recommended baseline
- [property]: [recommended pattern]
```

---

## Step 3 — Wait for Confirmation

Do not write the baseline immediately after an audit.

Ask:

```txt
Audit complete. Before I establish the baseline in docs/UI_REGISTRY.md, do these recommendations look right?
```

Wait for confirmation.

---

## Step 4 — Write Confirmed Baseline

After confirmation, write:

```markdown
# UI Registry

## Baseline — Established [date]

| Property | Correct pattern |
| --- | --- |
| Page background | [pattern] |
| Card background | [pattern] |
| Card border | [pattern] |
| Card radius | [pattern] |
| Primary button | [pattern] |
| Secondary button | [pattern] |
| Text primary | [pattern] |
| Text secondary | [pattern] |
| Text muted | [pattern] |
| Input background | [pattern] |
| Input border | [pattern] |
| Focus state | [pattern] |
```

Then list components that should be fixed later if they deviate from the baseline.

---

## Using the Registry

Before building new UI, the agent should read `docs/UI_REGISTRY.md`.

New UI should match established patterns unless the user intentionally wants a new pattern.

If a new pattern is needed, it should be added deliberately, not accidentally.

---

## What Imprint Mode Is Not

Imprint mode is not visual redesign.

Imprint mode is not code review.

Imprint mode is not accessibility audit, though accessibility concerns may be flagged.

Imprint mode is not a dumping ground for every class in a component.

---

## Standard

Consistency is a habit, not a feature.

A UI registry that is sometimes updated cannot be trusted.

If UI changed, imprint it.
