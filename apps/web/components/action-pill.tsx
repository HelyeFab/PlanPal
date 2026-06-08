import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";

type ActionPillVariant = "solid" | "soft" | "ghost";

type ActionPillProps = {
  children: ReactNode;
  /** Plain link target (hash anchors, external). Renders a raw <a>. */
  href?: string;
  /** Locale-aware internal route (e.g. "/professional"). Renders next-intl <Link>. */
  localeHref?: string;
  variant?: ActionPillVariant;
  /** Highlights the pill as the current item (e.g. active nav). */
  active?: boolean;
  /** Optional leading glyph (emoji or small inline svg). */
  icon?: ReactNode;
  className?: string;
  type?: "button" | "submit";
  /** Click handler for the button form (ignored when href/localeHref is set). */
  onClick?: () => void;
};

const base =
  "inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60";

const variantClasses: Record<ActionPillVariant, string> = {
  solid: "bg-brand text-white hover:bg-brand-strong",
  soft: "bg-brand-soft text-brand hover:bg-white",
  ghost: "text-muted hover:bg-white hover:text-ink",
};

/**
 * Pill-shaped button or link — the building block for nav chips and actions.
 * Renders semantic <a> when `href` is provided, otherwise a real <button>.
 */
export function ActionPill({
  children,
  href,
  localeHref,
  variant = "soft",
  active = false,
  icon,
  className = "",
  type = "button",
  onClick,
}: ActionPillProps) {
  const activeClasses = active ? "bg-brand text-white hover:bg-brand-strong" : "";
  const classes = `${base} ${active ? activeClasses : variantClasses[variant]} ${className}`.trim();

  const content = (
    <>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </>
  );

  if (localeHref) {
    return (
      <Link
        href={localeHref}
        className={classes}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} aria-current={active ? "page" : undefined}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
