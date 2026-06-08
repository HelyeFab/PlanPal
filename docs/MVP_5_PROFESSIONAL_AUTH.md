# PlanPal MVP 5 — Professional Firebase Auth

Version: 0.1
Status: Implemented

## Flow name

Professional Firebase Auth (email/password) + protected professional shell.

## Goal

```txt
Professional signs in
→ app knows the authenticated nutritionist UID
→ the professional area is protected
→ the existing plan builder still works
→ no cloud plan writes yet
```

## User

The professional (nutritionist). No client login.

## Account provisioning

> Professional accounts are provisioned manually for the MVP (created in the
> Firebase Console). Self-service sign-up is intentionally out of scope.

This keeps the MVP a controlled SaaS pilot rather than open public registration.

## Auth method

Firebase Auth **email/password only**. No Google/OAuth, no sign-up, no password
reset (all deferred, see ADR-010).

## Routes

| Route | Access |
| --- | --- |
| `/[locale]/sign-in` | Public (dynamic — reads `?from`) |
| `/[locale]/professional` | Protected — redirects to sign-in when signed out |
| `/[locale]` (home) | Public |

Localised at `/en/*` and `/it/*`.

## How it works

- `AuthProvider` (client) wraps the app inside `NextIntlClientProvider` and
  exposes `{ user, loading, configured }` via `onAuthStateChanged`. Firebase's
  default local persistence keeps the session across reloads.
- `RequireAuth` (client) gates the professional area: shows a loading state while
  auth resolves, redirects to `/[locale]/sign-in?from=…` when signed out, and a
  "Firebase not configured" notice when the client config is missing.
- `SignInForm` calls `signInWithEmailAndPassword`, maps Firebase error codes to
  localised messages, and on success redirects to the validated `from` (default
  `/professional`).
- `AccountMenu` (in the minimal header) shows the email + a sign-out action.
- The builder stamps `user.uid` into the local draft as `nutritionistId`.

## Data ownership

```txt
nutritionistId === Firebase Auth UID
future Firestore root: nutritionists/{uid}
```

No Firestore document is created in this flow — the UID is only made available.

## Security model

The professional area is protected by a **client-side UX gate, not a server
security boundary** — acceptable now because nothing private is served/written
server-side and the builder is localStorage-only. The real boundary (session
cookie + Firebase Admin verification + Firestore rules
`request.auth.uid == nutritionistId`) is a prerequisite of the persistence flow.
See `docs/SECURITY_BOUNDARIES.md` and ADR-010.

## Environment variables

Client config only (already in `apps/web/.env.example`):

```txt
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

No Admin SDK / service-account secrets are used in this pass. Copy
`.env.example` → `.env.local` and fill from a real Firebase project to enable
sign-in. Missing config shows the localised "Firebase not configured" notice.

## Out of scope

```txt
Firestore plan writes · client login / invites · Google auth · self-service
sign-up · password reset · Firebase Admin SDK · billing · roles beyond
professional · clinic / team accounts
```

## Next flow

Cloud persistence: mint a session cookie from the ID token, verify it server-side
with the Firebase Admin SDK, add Firestore security rules, and map the builder
draft to `nutritionists/{uid}/patients/.../plans/...` (MVP_2). Needs its own
architect blueprint.
