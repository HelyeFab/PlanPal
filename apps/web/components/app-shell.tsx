import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ActionPill } from "./action-pill";
import { LanguageSwitcher } from "./language-switcher";
import { AccountMenu } from "./auth/account-menu";
import { Link } from "@/i18n/navigation";

type NavKey = "today" | "plan" | "assistant" | "shopping";
const NAV_ITEMS: { key: NavKey; href: string; active?: boolean }[] = [
  { key: "today", href: "#today", active: true },
  { key: "plan", href: "#plan" },
  { key: "assistant", href: "#assistant" },
  { key: "shopping", href: "#shopping" },
];

/** Small inline brand mark — a leaf/spark, no external asset needed. */
function BrandMark() {
  return (
    <span
      className="flex size-9 items-center justify-center rounded-2xl bg-brand text-white shadow-soft"
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 13c0-4.4 3.6-8 8-8h6v6c0 4.4-3.6 8-8 8H5v-6Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M9 16c1.5-3.5 4-6 8-7.5"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/**
 * AppShell — sticky header (logo, optional in-page nav, language switcher,
 * primary CTA) wrapping the page.
 *
 * `nav="home"` (default) shows the home page's section-anchor nav and the
 * "Ask PlanPal" CTA. `nav="minimal"` (used by inner pages like the plan builder)
 * shows just the logo + language switcher. The logo always links home.
 */
export function AppShell({
  children,
  nav = "home",
}: {
  children: ReactNode;
  nav?: "home" | "minimal";
}) {
  const t = useTranslations();
  const isHome = nav === "home";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-lg font-bold tracking-tight text-ink">
              Plan<span className="text-brand">Pal</span>
            </span>
          </Link>

          {isHome ? (
            <nav
              aria-label={t("nav.ariaPrimary")}
              className="ml-2 hidden flex-1 items-center gap-1 md:flex"
            >
              {NAV_ITEMS.map((item) => (
                <ActionPill
                  key={item.href}
                  href={item.href}
                  variant="ghost"
                  active={item.active}
                >
                  {t(`nav.${item.key}`)}
                </ActionPill>
              ))}
            </nav>
          ) : null}

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {isHome ? (
              <>
                {/* On home, the switcher sits in the mobile nav row below to keep
                    the top row from overflowing; shown here only from md up. */}
                <div className="hidden md:block">
                  <LanguageSwitcher />
                </div>
                <ActionPill href="#assistant" variant="solid" icon="✦">
                  {t("common.askPlanPal")}
                </ActionPill>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <AccountMenu />
              </>
            )}
          </div>
        </div>

        {isHome ? (
          // Mobile nav row: horizontally scrollable pills + language switcher.
          <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
            <nav
              aria-label={t("nav.ariaPrimary")}
              className="flex min-w-0 flex-1 gap-2 overflow-x-auto"
            >
              {NAV_ITEMS.map((item) => (
                <ActionPill
                  key={item.href}
                  href={item.href}
                  variant="soft"
                  active={item.active}
                  className="shrink-0"
                >
                  {t(`nav.${item.key}`)}
                </ActionPill>
              ))}
            </nav>
            <div className="shrink-0">
              <LanguageSwitcher />
            </div>
          </div>
        ) : null}
      </header>

      <main id="top" className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-faint sm:px-6">
        {t("footer.disclaimer")}
      </footer>
    </div>
  );
}
