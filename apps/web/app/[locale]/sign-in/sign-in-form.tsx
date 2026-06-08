"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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

  // Already signed in → leave the sign-in page.
  useEffect(() => {
    if (!loading && user) router.replace(destination);
  }, [loading, user, destination, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!configured || submitting) return;
    setSubmitting(true);
    setErrorKey(null);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
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
