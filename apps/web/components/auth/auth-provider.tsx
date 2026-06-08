"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { isFirebaseClientConfigured } from "@/lib/env";
import { getFirebaseAuth } from "@/lib/firebase/client";

type AuthState = {
  /** Signed-in professional, or null. */
  user: User | null;
  /** True until the initial auth check resolves. */
  loading: boolean;
  /** False when NEXT_PUBLIC_FIREBASE_* is missing (dev notice path). */
  configured: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  configured: false,
});

/**
 * Provides client-side auth state via Firebase's `onAuthStateChanged`.
 * Session persistence is Firebase's default (local/IndexedDB), so sign-in
 * survives reloads. When Firebase isn't configured, `loading` starts false so
 * the UI can show the "not configured" notice instead of spinning forever.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Same value on server and client (NEXT_PUBLIC_* is inlined) → no mismatch.
  const [loading, setLoading] = useState(isFirebaseClientConfigured);

  useEffect(() => {
    if (!isFirebaseClientConfigured) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, configured: isFirebaseClientConfigured }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

/** The signed-in professional's UID = nutritionistId (ADR-010), or null. */
export function useNutritionistId(): string | null {
  return useAuth().user?.uid ?? null;
}
