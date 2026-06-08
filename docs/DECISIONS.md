# PlanPal Decisions

This file records durable project decisions.

Use it when a choice affects future product, architecture, data, UI, deployment, tooling, or agent workflow.

Do not record every tiny implementation detail. Record decisions that a future agent or developer would otherwise reopen or misunderstand.

---

## ADR-001: GitHub is the source of truth

Date: 2026-06-08
Status: Accepted

### Context

The project started in conversation, but a serious MVP needs stable project memory outside chat.

### Decision

GitHub is the source of truth for PlanPal.

Conversation is used for thinking and collaboration. Durable project knowledge must be saved in the repository.

### Reasoning

Chat history is not reliable enough for multi-session development. Repository files can be read by future agents, reviewed, changed, versioned and restored.

### Consequences

Positive:

- Future sessions can restore context from the repo.
- Decisions and specifications can be reviewed like normal project assets.
- The project is not dependent on a single conversation.

Negative / trade-offs:

- Important thinking must be saved deliberately.
- More discipline is required at the end of each session.

### Implications for future work

- Save durable knowledge in `docs/`.
- Save current handoff state in `memory.md`.
- Save reusable agent behaviour in `.agent/`.

---

## ADR-002: Build as a PWA before native mobile

Date: 2026-06-08
Status: Accepted

### Context

PlanPal may eventually benefit from a native mobile app, but the first goal is to validate the professional and client workflow quickly.

### Decision

The MVP should start as a Next.js PWA rather than a Flutter or native mobile app.

### Reasoning

A PWA is faster to build, easier to deploy, easier to combine with a professional dashboard, and good enough to test the core workflow on mobile devices.

### Consequences

Positive:

- Faster MVP delivery.
- Shared codebase for dashboard and client experience.
- Easier deployment through Vercel.

Negative / trade-offs:

- Native app features are deferred.
- App store distribution is not part of the MVP.

### Implications for future work

- Do not add Flutter or native mobile structure during the MVP.
- Reconsider native apps only after the workflow is validated.

---

## ADR-003: The assistant supports professional plans, it does not create diets

Date: 2026-06-08
Status: Accepted

### Context

The core product idea is to help clients follow an existing professional plan in real life.

### Decision

PlanPal should not position the MVP as a diet generator.

The assistant should answer from the active plan and professional-approved information.

### Reasoning

This keeps the product clearer, safer, and more differentiated from generic AI diet tools.

### Consequences

Positive:

- Stronger product positioning.
- Safer assistant behaviour.
- Clearer value for professionals.

Negative / trade-offs:

- The assistant must be constrained.
- Some user questions may need to be redirected back to the professional.

### Implications for future work

- Do not build automatic plan generation into the MVP.
- Assistant prompts must emphasise plan support rather than plan creation.
- Data model should favour approved options and structured plan context.

---

## ADR-004: Store approved food options inside food slots for MVP

Date: 2026-06-08
Status: Accepted

### Context

The MVP needs simple substitutions and easy assistant context construction.

### Decision

For MVP 0.1, food options should be embedded inside the `FoodSlot` document.

### Reasoning

Options are small, always read with their slot, and substitution logic depends on comparing options within the same slot.

### Consequences

Positive:

- Simpler Firestore reads.
- Easier assistant context building.
- Easier substitution logic.

Negative / trade-offs:

- Options are not reusable across plans at first.
- If options become large or shared, the model may need to evolve.

### Implications for future work

- Keep MVP substitution logic slot-based.
- Do not introduce a broad food option database until there is a real need.
