/**
 * Map a Firebase Auth error to a localised message key under `auth.errors`.
 * Keeps raw Firebase codes out of the UI and avoids leaking which part of the
 * credential was wrong.
 */
export type AuthErrorKey = "invalid" | "tooMany" | "network" | "generic";

export function firebaseErrorKey(error: unknown): AuthErrorKey {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "invalid";
    case "auth/too-many-requests":
      return "tooMany";
    case "auth/network-request-failed":
      return "network";
    default:
      return "generic";
  }
}
