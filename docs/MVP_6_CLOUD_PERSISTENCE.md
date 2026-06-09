# PlanPal MVP 6 — Cloud Persistence

Version: 0.1
Status: Implemented

## Flow name

Cloud persistence — save/load the current structured plan with a real server
security boundary.

## Goal

```txt
Authenticated professional
→ verified server session (cookie)
→ Firestore ownership boundary (rules + server verification)
→ save the builder draft under nutritionists/{uid}/patients/{pid}/plans/{planId}/…
→ load the saved draft safely
```

## User

The professional (nutritionist).

## Security model (the point of MVP-6)

This is where the real boundary starts (ADR-011, docs/SECURITY_BOUNDARIES.md):

1. **Session cookie** — sign-in exchanges the Firebase ID token for an httpOnly,
   SameSite=Lax session cookie (Secure in production). Verified server-side with
   the Admin SDK. Sign-out clears it.
2. **Server verification** — every data API route and the professional page
   server-verify the cookie. The `nutritionistId` is the **verified-cookie UID**,
   never a client-supplied value.
3. **Firestore rules** — `firestore.rules`: deny-by-default, allow only
   `request.auth.uid == nutritionistId` under `nutritionists/{uid}` (defence in
   depth; the app uses the Admin SDK, which bypasses rules).

CSRF: SameSite=Lax + same-origin `Origin` check on mutation routes. All writes
are validated/whitelisted server-side.

## Routes / APIs (Node runtime)

| Route | Purpose |
| --- | --- |
| `POST /api/auth/session` | Mint session cookie from an ID token |
| `DELETE /api/auth/session` | Clear the session cookie (sign-out) |
| `GET /api/plan` | Load the professional's current plan |
| `PUT /api/plan` | Upsert the current plan (+ delete removed meals/slots) |
| `/[locale]/professional` | Server-gated (cookie) page |

## Data model

```txt
nutritionists/{uid}
  patients/{patientId}        ← client name/note
    plans/{planId}            ← title/status/language/notes
      meals/{mealId}          ← name/displayName/timeLabel/sortOrder/notes
        slots/{slotId}        ← label/category/required/sortOrder/notes/options[]
```

Options are embedded in the slot (ADR-004). Server stamps `nutritionistId`,
`createdAt` (first write), `updatedAt`. MVP-6 supports **one** current
patient/plan per professional.

## Save / load behaviour

- **Load-on-mount:** the builder fetches `GET /api/plan`; if a plan exists it is
  the source of truth. Otherwise it falls back to the localStorage buffer, then
  the example seed.
- **Explicit Save:** a **Save** button calls `PUT /api/plan`. First save mints
  stable `patientId`/`planId` (stored in the draft). No autosave.
- **Delete-removed:** `PUT` reads the existing meals/slots and, in one batch,
  upserts submitted docs and **deletes meals/slots no longer present** (no zombie
  documents). Removed-meal slots are deleted explicitly (Firestore has no cascade).
- **Save state:** the toolbar shows Saving… / Saved / Unsaved changes / error.
- localStorage remains an offline buffer; the cloud is the source of truth.

## Setup required (the developer)

1. **Enable Firestore** (Native mode) in the Firebase Console.
2. **Service account:** Project settings → Service accounts → Generate new
   private key → put `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
   `FIREBASE_PRIVATE_KEY` in `apps/web/.env.local` (server-only secrets; the key
   keeps its `\n` escaping). **Never commit `.env.local` or the JSON.**
3. **Deploy rules:** `firebase deploy --only firestore:rules` (or paste
   `firestore.rules` into the Console rules editor).

Until the Admin service account is configured, the professional page falls
through to the client "Firebase not configured" notice and the APIs return 503.

## Out of scope

```txt
multi-client dashboard · multi-plan management · client login · assistant route
· shopping-list logic · autosave · Google auth · password reset · billing
· real-time sync · plan history/versioning
```

## Next flow

The AI assistant route (MVP_3): server-side, reuses the verified session +
Admin SDK to build the plan context and answer grounded questions. Needs its own
architect blueprint.
