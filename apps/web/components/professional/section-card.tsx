import type { ReactNode } from "react";

/** Standard builder card: white rounded surface with a heading, optional
 * subtitle, and an optional header action (e.g. an "Add" button). */
export function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-soft">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Small round "remove" button used on repeatable rows (meals/slots/options). */
export function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span aria-hidden="true" className="text-base leading-none">
        ×
      </span>
    </button>
  );
}
