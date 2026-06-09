# PlanPal Security Boundaries

Version: 0.1
Status: Draft

## Purpose

This document defines the first security and access boundaries for PlanPal.

The goal is to make sure future implementation keeps professional-owned data separate and does not expose private information through client code or assistant context.

---

## Core Principle

Users should only access data they are explicitly allowed to access.

The MVP should favour simple, obvious ownership rules over clever permission systems.

---

## Initial Roles

PlanPal has two main roles:

```txt
professional
client
```

The first MVP may implement the professional dashboard before full client login.

Do not assume client authentication exists until it is explicitly built.

---

## Professional Boundary

A professional owns:

- their profile
- their clients
- their clients' plans
- meals inside those plans
- food slots inside those meals
- assistant questions linked to those clients
- professional-level rules

Expected Firestore ownership root:

```txt
nutritionists/{nutritionistId}
```

For professional-only access, the expected rule is:

```txt
request.auth.uid == nutritionistId
```

---

## Client Boundary

Client access should not be improvised.

When client login is added, use an explicit mapping document such as:

```txt
clientAccounts/{uid}
```

Example:

```json
{
  "nutritionistId": "nutri_001",
  "patientId": "patient_001"
}
```

This mapping should control what the client can read or write.

---

## Client Access Defaults

A client should only be able to access:

- their own active plan
- their own plan display data
- their own assistant question history if enabled

A client should not be able to access:

- other clients
- professional-level dashboard data
- rules not intended for display
- billing data
- system prompts
- private implementation metadata

---

## Secret Handling

Secrets must never be exposed to client code.

Server-only secrets include:

- OpenAI API keys
- Firebase Admin credentials
- service account credentials
- webhook secrets
- private integration keys

Any code that uses secrets must remain server-side.

---

## Assistant Context Boundary

The assistant should receive only the information needed to answer the current question.

Do not send unnecessary private data.

Preferred assistant context:

- client display name or first name if needed
- active plan title and language
- relevant meals
- relevant food slots
- relevant approved options
- applicable professional rules

Avoid sending:

- unrelated client records
- all professional clients
- billing information
- raw credentials
- unnecessary personal data

---

## Firestore Path Discipline

Follow:

```txt
docs/MVP_2_FIRESTORE_SCHEMA.md
```

Do not invent new paths without updating the schema or decision log.

Data path drift is a security risk.

---

## MVP Security Strategy

For the earliest implementation, prefer:

1. Professional-only authenticated dashboard.
2. Server-side data access where practical.
3. Explicit client access mapping later.
4. Minimal assistant context.
5. Simple security rules based on ownership.

---

## Authentication (current state — ADR-010)

Professional sign-in is **Firebase Auth email/password**. The Firebase Auth
**UID is the canonical `nutritionistId`**; future writes go to
`nutritionists/{uid}`.

### What protects the professional area today

A **client-side gate** (`RequireAuth`) redirects signed-out users to
`/[locale]/sign-in`.

> ⚠️ This is a **UX gate, not a server security boundary.** It does not stop a
> determined request from reaching server-rendered output.

It is acceptable **only because**, right now:

- no private data is fetched or rendered server-side,
- there are no Firestore reads or writes,
- the plan builder is localStorage-only (per-browser),
- no cloud data is exposed.

### The real boundary — IMPLEMENTED in MVP-6 (ADR-011)

Cloud persistence ships with the real server boundary, all three layers:

1. ✅ **Session cookie** minted from the Firebase ID token (httpOnly,
   SameSite=Lax, Secure in prod) — `lib/auth/server-session.ts`.
2. ✅ **Server-side verification** with the Firebase **Admin SDK**
   (`verifySessionCookie`) before any read/write, in the **route handlers**
   (`/api/plan`, `/api/auth/session`) **and** as a **server gate on the
   professional page**. The `nutritionistId` is the verified-cookie UID — never
   a client-supplied value.
3. ✅ **Firestore security rules** (`firestore.rules`) deny-by-default + allow
   only `request.auth.uid == nutritionistId` under `nutritionists/{uid}`
   (defence-in-depth; Admin SDK bypasses rules, so these lock out direct
   client-SDK access). **Must be deployed** to the Firebase project.

The client `RequireAuth` remains a UX gate only. CSRF is mitigated by
SameSite=Lax + a same-origin `Origin` check on mutation routes (no token yet).
All data writes are validated/whitelisted server-side before persisting.

### Secrets

- Client uses only the public `NEXT_PUBLIC_FIREBASE_*` web config.
- **No** Admin SDK / service-account credentials are present in this auth pass.
- No auth-disabled bypass flag exists (intentionally — it could become dangerous
  once Firestore lands). Missing client config shows a "not configured" notice.
- The `from` redirect is validated to internal, locale-stripped, allow-listed
  paths only (no open redirects).

---

## Not Yet Implemented

The following should not be assumed until explicitly built:

- client login
- client invite flow
- billing roles
- clinic admin roles
- white-label tenant roles
- multi-professional clinics

---

## Review Checklist

Before shipping a feature, check:

- Does it expose only necessary data?
- Does it follow documented Firestore paths?
- Does client code import server-only modules?
- Are secrets used only server-side?
- Does the assistant receive only relevant context?
- Are access assumptions documented?

---

## Standard

Security should be boring and obvious.

If a future agent cannot quickly tell who owns a document and who may access it, the model is too vague.
