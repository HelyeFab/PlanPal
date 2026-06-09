"use client";

import { signOut } from "firebase/auth";
import { useTranslations } from "next-intl";

import { useAuth } from "./auth-provider";
import { ActionPill } from "../action-pill";
import { useRouter } from "@/i18n/navigation";
import { getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Header account control: shows the signed-in professional's email (from `sm`
 * up) and a sign-out action. Renders nothing when signed out, so it is safe to
 * place in any minimal-header page (e.g. sign-in).
 */
export function AccountMenu() {
  const { user } = useAuth();
  const t = useTranslations("auth");
  const router = useRouter();

  if (!user) return null;

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    // Clear the server session cookie too.
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/sign-in");
  }

  return (
    <div className="flex items-center gap-2">
      {user.email ? (
        <span className="hidden max-w-[12rem] truncate text-xs font-medium text-muted sm:inline">
          {user.email}
        </span>
      ) : null}
      <ActionPill variant="ghost" onClick={handleSignOut}>
        {t("signOut")}
      </ActionPill>
    </div>
  );
}
