/**
 * Firebase Admin (server) SDK setup.
 *
 * `server-only` makes any accidental import from a client component a build
 * error, keeping the service-account credentials off the browser. Initialisation
 * is lazy so an unconfigured scaffold still builds.
 *
 * See docs/SECURITY_BOUNDARIES.md — secrets must remain server-side.
 */
import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { getServerEnv, isFirebaseAdminConfigured } from "@/lib/env";

const ADMIN_APP_NAME = "planpal-admin";

/** Initialise (or reuse) the Firebase Admin app. */
export function getAdminApp(): App {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (see apps/web/.env.example).",
    );
  }

  const existing = getApps().find((app) => app.name === ADMIN_APP_NAME);
  if (existing) {
    return existing;
  }

  const { firebaseAdmin } = getServerEnv();
  return initializeApp(
    {
      credential: cert({
        projectId: firebaseAdmin.projectId,
        clientEmail: firebaseAdmin.clientEmail,
        privateKey: firebaseAdmin.privateKey,
      }),
    },
    ADMIN_APP_NAME,
  );
}

/** Firebase Admin Auth (server). */
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

/** Firestore via the Admin SDK (server). */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
