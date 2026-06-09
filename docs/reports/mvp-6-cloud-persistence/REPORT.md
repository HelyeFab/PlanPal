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

## Deployment & runtime verification (2026-06-09)

The project is fully configured and the boundary is live on `planpal-11ff7`:

- **Admin service account** wired into `apps/web/.env.local` (server-only,
  gitignored; the `*-firebase-adminsdk-*.json` key file is also gitignored and
  was never staged).
- **`.firebaserc`** added (default project `planpal-11ff7`) — committed.
- **Firestore rules deployed:** `firebase deploy --only firestore:rules` →
  compiled successfully and released to cloud.firestore.
- **Runtime checks (dev server, no session cookie):**
  - `GET /api/plan` → **401** (Admin configured; previously 503 not-configured).
  - `GET /it/professional` → **307** → `/it/sign-in?from=/professional`
    (server-side cookie gate active).
  - `GET /en/sign-in` → **200** (reachable).

The interactive end-to-end (sign-in → cookie → Save → reload → load → remove
meal/slot → Save → reload → confirm removed → sign-out → redirect) is now
exercisable in the browser with a Console-provisioned professional account.

### Security note
While writing `.env.local`, the harness echoed the file (including the private
key) into the session transcript. The key is gitignored and never committed, but
if the transcript is shared the key should be rotated in the Firebase Console.
The same applies to the test professional's password used in the browser E2E.

## Browser E2E verification (2026-06-09) — 18/18 PASS

A **real headless Chromium** (Puppeteer) drove the actual UI against live
`planpal-11ff7`, signed in as the provisioned professional. All 18 assertions
passed:

- Sign in (`/it/sign-in`) → `POST /api/auth/session` 200 → redirected to `/it/professional`. ✓
- Load sample (2 meals) → **Save** (`PUT /api/plan` 200). ✓
- **Reload → loads from Firestore** (`GET /api/plan` 200, 2 meals). ✓
- Remove one meal → Save → reload → **removed meal does NOT reappear** (2→1). ✓
- Remove one food slot → Save → reload → **removed slot does NOT reappear**
  (slots 4 → 2 after meal removal → 1); meal count unchanged. ✓
- **Sign out → session cookie cleared.** ✓
- Signed-out `/it/professional` → redirects to `/it/sign-in`. ✓
- Signed-out `/en/professional` → `/en/sign-in`; `/en/sign-in` renders the form. ✓

Stale-document deletion (the special concern) is confirmed end-to-end: removed
meals/slots are gone from Firestore and stay gone across reloads. The test
restored a clean 2-meal example before sign-out; the professional account was
**kept** (not deleted), per request. The Puppeteer script (which embedded the
test password) was removed and never committed; Puppeteer was installed with
`--no-save` (no package.json/lock change).

## Known limitations

- One current patient/plan per professional (multi-plan deferred).
- Explicit Save only (no autosave).
- localStorage buffer is per-browser, not per-user.
- Requires the Admin service account + deployed rules (now configured/deployed on
  `planpal-11ff7`; elsewhere the page shows the "not configured" notice and the
  APIs return 503 until set up).

## Next recommended flow

The AI assistant route (MVP_3): server-side, reusing the verified session + Admin
SDK to build plan context and answer grounded questions. Needs its own blueprint.
