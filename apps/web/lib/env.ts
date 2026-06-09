/**
 * Environment access helper.
 *
 * - `clientEnv` only ever reads NEXT_PUBLIC_* values, which Next.js inlines into
 *   the client bundle. These are safe to expose (Firebase web config is public).
 * - `getServerEnv()` reads server-only secrets from process.env. It must never be
 *   imported into client components. See docs/SECURITY_BOUNDARIES.md.
 */

/** Public Firebase web config — safe for the browser. */
export const clientEnv = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  },
} as const;

/** True when the public Firebase config has the minimum fields to initialise. */
export const isFirebaseClientConfigured =
  clientEnv.firebase.apiKey.length > 0 &&
  clientEnv.firebase.projectId.length > 0 &&
  clientEnv.firebase.appId.length > 0;

/**
 * Server-only secrets. Call this inside server code (route handlers, server
 * components, server actions) — never in client components.
 *
 * FIREBASE_PRIVATE_KEY is stored with escaped newlines in env files and is
 * un-escaped here for the Firebase Admin SDK.
 */
export function getServerEnv() {
  return {
    firebaseAdmin: {
      projectId: process.env.FIREBASE_PROJECT_ID ?? "",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY ?? "",
      // Configurable; the default is verified against OpenAI's available API
      // models at implementation time (MVP-7). See docs/MVP_7_PLAN_GROUNDED_ASSISTANT.md.
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
    },
  };
}

/** True when the Firebase Admin credentials are present server-side. */
export function isFirebaseAdminConfigured(): boolean {
  const { firebaseAdmin } = getServerEnv();
  return (
    firebaseAdmin.projectId.length > 0 &&
    firebaseAdmin.clientEmail.length > 0 &&
    firebaseAdmin.privateKey.length > 0
  );
}

/** True when the OpenAI API key is present server-side (assistant enabled). */
export function isOpenAIConfigured(): boolean {
  return getServerEnv().openai.apiKey.length > 0;
}
