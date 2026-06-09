# Execution Report — MVP-6 Cloud Persistence

Flow: verified professional session → Firestore ownership boundary → save/load
the current structured plan.
Doc: `docs/MVP_6_CLOUD_PERSISTENCE.md` · Decision: ADR-011.

## Routes added

| Route | Purpose |
| --- | --- |
| `POST /api/auth/session` | Mint httpOnly session cookie from a Firebase ID token |
| `DELETE /api/auth/session` | Clear the session cookie (sign-out) |
| `GET /api/plan` | Load the professional's current plan (cookie-verified) |
| `PUT /api/plan` | Upsert the plan + delete removed meals/slots (cookie-verified) |
| `/[locale]/professional` | Now server-gated (force-dynamic, cookie verify → redirect) |

All API routes + the professional page run on the **Node runtime**.

## Files created

- `app/api/auth/session/route.ts`, `app/api/plan/route.ts`
- `lib/auth/server-session.ts` (cookie mint/verify, `getCurrentNutritionistId`, same-origin guard)
- `lib/professional/firestore-mapping.ts` (pure validate + BuilderState ↔ Firestore mappers)
- `lib/professional/cloud.ts` (client GET/PUT wrappers)
- `firestore.rules`, `firebase.json`
- `docs/MVP_6_CLOUD_PERSISTENCE.md`, this report folder

## Files updated

- `app/[locale]/professional/page.tsx` — server cookie gate + `force-dynamic`
- `app/[locale]/sign-in/sign-in-form.tsx` — mint session cookie after sign-in
- `components/auth/account-menu.tsx` — clear cookie on sign-out
- `components/professional/professional-plan-builder.tsx` — load-on-mount + Save + save-state
- `lib/professional/{types,reducer,example-plan,storage}.ts` — `patientId`/`planId`
- `messages/{en,it}.json` — `cloud` namespace + `auth.errors.session`
- `docs/DECISIONS.md` (ADR-011), `docs/SECURITY_BOUNDARIES.md` (boundary implemented),
  `docs/UI_REGISTRY.md` (v0.8 save toolbar), `memory.md`

## Auth method / security

Email/password (MVP-5) **+** server session cookie (this flow). The
`nutritionistId` is the **verified-cookie UID**, never client-supplied. Firestore
rules deny-by-default + `request.auth.uid == nutritionistId`. CSRF: SameSite=Lax
+ same-origin Origin check. Server validates/whitelists every write. Cookie:
httpOnly + Lax always, Secure in production only.

## Env vars required

Client (MVP-5): `NEXT_PUBLIC_FIREBASE_*` (6). **New server secrets (MVP-6):**
`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` from a
service account — server-only, gitignored, host-env in production. Firestore
must be enabled and `firestore.rules` deployed.

## Delete-removed-children handling

`PUT /api/plan` reads existing meals + slots, then in one batch upserts submitted
docs and deletes meals/slots no longer present (removed-meal slots deleted
explicitly — Firestore has no cascade). No zombie documents.

## Checks run (outputs in this folder)

| Command | Result | File |
| --- | --- | --- |
| `npm run typecheck` | PASS (exit 0) | `typecheck.txt` |
| `npm run lint` | PASS (exit 0) | `lint.txt` |
| `npm run build` | PASS (exit 0) — APIs + professional dynamic, home SSG | `build.txt` |

Manual end-to-end (sign-in → cookie → save → reload → load → remove meal/slot →
save → reload → confirm removed → sign-out clears cookie → signed-out redirect)
requires the developer's service-account key configured locally.

## Known limitations

- One current patient/plan per professional (multi-plan deferred).
- Explicit Save only (no autosave).
- Needs the Admin service account + deployed rules to function; until then the
  professional page shows the "not configured" notice and APIs return 503.
- localStorage buffer is per-browser, not per-user.

## Next recommended flow

The AI assistant route (MVP_3): server-side, reusing the verified session + Admin
SDK to build plan context and answer grounded questions. Needs its own blueprint.
