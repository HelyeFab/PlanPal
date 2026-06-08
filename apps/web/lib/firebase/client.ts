/**
 * Firebase client (browser) SDK setup.
 *
 * Everything is lazy: nothing initialises at import time, so an unconfigured
 * scaffold builds and renders without a live Firebase project. Call the getters
 * from client code once real config is present.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import { clientEnv, isFirebaseClientConfigured } from "@/lib/env";

/** Initialise (or reuse) the Firebase browser app. */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseClientConfigured) {
    throw new Error(
      "Firebase client is not configured. Set the NEXT_PUBLIC_FIREBASE_* environment variables (see apps/web/.env.example).",
    );
  }
  return getApps().length ? getApp() : initializeApp(clientEnv.firebase);
}

/** Firebase Authentication for the browser. */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/** Firestore for the browser. */
export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
