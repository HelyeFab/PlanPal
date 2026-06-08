"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { useAuth } from "./auth-provider";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Client-side route guard for the professional area.
 *
 * NOTE: this is a UX gate, not a server security boundary. It is acceptable now
 * because nothing private is fetched/rendered server-side and the builder is
 * localStorage-only (ADR-009/ADR-010). Real enforcement (session cookie +
 * Firebase Admin verification + Firestore rules) arrives with the persistence
 * flow. See docs/SECURITY_BOUNDARIES.md.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("auth");

  useEffect(() => {
    if (configured && !loading && !user) {
      router.replace(`/sign-in?from=${encodeURIComponent(pathname)}`);
    }
  }, [configured, loading, user, pathname, router]);

  if (!configured) {
    return (
      <div className="mx-auto max-w-md rounded-card border border-line bg-surface p-6 text-center shadow-soft">
        <p className="text-base font-bold text-ink">
          {t("notConfigured.title")}
        </p>
        <p className="mt-2 text-sm text-muted">{t("notConfigured.body")}</p>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div
        className="flex min-h-48 items-center justify-center text-sm text-muted"
        role="status"
      >
        {loading ? t("loading") : t("mustSignIn")}
      </div>
    );
  }

  return <>{children}</>;
}
