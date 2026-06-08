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

---

## ADR-005: Scaffold as npm monorepo with Tailwind, Firebase and UI from the start

Date: 2026-06-08
Status: Accepted

### Context

Before scaffolding the actual application, the open implementation decisions were repository layout, package manager, styling approach, Firebase timing and whether to establish UI immediately.

### Decision

PlanPal should be scaffolded as a monorepo using npm workspaces.

The first app should live under:

```txt
apps/web
```

Shared code should live under:

```txt
packages/shared
```

The app should use Tailwind from the start.

Firebase should be configured from the start.

The first UI shell and visual baseline should be created immediately rather than postponed.

### Reasoning

A monorepo gives the project room to grow without needing a later restructuring. npm keeps tooling familiar and avoids adding package-manager complexity. Tailwind from the start prevents early UI from drifting. Firebase from the start forces auth and data assumptions to be designed honestly rather than bolted on later. Creating the first UI baseline immediately lets `docs/UI_REGISTRY.md` become useful early.

### Consequences

Positive:

- Clear structure for web app and shared types.
- Early alignment between data model, Firebase and UI.
- UI consistency can be established from the first screens.
- Future packages can be added without restructuring the repository.

Negative / trade-offs:

- Initial scaffold is slightly more complex than a single-app setup.
- Firebase configuration must be handled carefully to avoid exposing secrets.
- Tailwind and UI baseline decisions must be kept consistent through imprint mode.

### Implications for future work

- Scaffold root `package.json` with npm workspaces.
- Create `apps/web` as the Next.js TypeScript PWA.
- Create `packages/shared` for shared domain types.
- Install and configure Tailwind during the initial scaffold.
- Add Firebase client/server structure during the initial scaffold.
- Establish the first UI baseline and update `docs/UI_REGISTRY.md` after UI shell creation.
