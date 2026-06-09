"use client";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { ActionPill } from "@/components/action-pill";
import { useAuth } from "@/components/auth/auth-provider";
import { TextField } from "@/components/professional/fields";
import { useRouter } from "@/i18n/navigation";
import { firebaseErrorKey } from "@/lib/auth/auth-errors";
import { sanitizeInternalPath } from "@/lib/auth/redirect";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Props = { from: string | null };

/** Email/password sign-in card. Redirects to the validated `from` on success. */
export function SignInForm({ from }: Props) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { user, loading, configured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const destination = sanitizeInternalPath(from);

  // Client auth persists (IndexedDB) independently of the httpOnly session cookie
  // (5-day expiry). If we land here WITH a client user, the server gate bounced
  // us because the cookie is missing/expired — re-establish it from a fresh ID
  // token before leaving. If that fails, sign out so the cookie/client states
  // agree and the redirect loop ends with the form shown.
  const reestablishing = useRef(false);
  useEffect(() => {
    if (loading || !user || reestablishing.current) return;
    reestablishing.current = true;
    void (async () => {
      try {
        const idToken = await user.getIdToken(true);
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        if (res.ok) {
          router.replace(destination);
          return;
        }
      } catch {
        // fall through to sign-out
      }
      await signOut(getFirebaseAuth());
      reestablishing.current = false;
    })();
  }, [loading, user, destination, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!configured || submitting) return;
    setSubmitting(true);
    setErrorKey(null);
    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      // Exchange the ID token for a server session cookie (the real boundary).
      const idToken = await credential.user.getIdToken();
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!sessionRes.ok) {
        // No server session → keep client/server state consistent and report.
        await signOut(getFirebaseAuth());
        setErrorKey("session");
        setSubmitting(false);
        return;
      }
      router.replace(destination);
    } catch (error) {
      setErrorKey(firebaseErrorKey(error));
      setSubmitting(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
        <h1 className="text-lg font-bold text-ink">{t("notConfigured.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("notConfigured.body")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-line bg-surface p-6 shadow-card"
      aria-busy={submitting}
    >
      <h1 className="text-xl font-bold text-ink">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>

      <div className="mt-5 flex flex-col gap-3">
        <TextField
          label={t("emailLabel")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder={t("emailPlaceholder")}
        />
        <TextField
          label={t("passwordLabel")}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder={t("passwordPlaceholder")}
        />
      </div>

      {errorKey ? (
        <p
          role="alert"
          className="mt-3 rounded-2xl bg-amber/15 px-3 py-2 text-sm font-medium text-amber"
        >
          {t(`errors.${errorKey}`)}
        </p>
      ) : null}

      <ActionPill
        variant="solid"
        type="submit"
        className="mt-5 w-full justify-center"
      >
        {submitting ? t("signingIn") : t("continue")}
      </ActionPill>
    </form>
  );
}
