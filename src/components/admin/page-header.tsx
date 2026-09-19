import { IndexLabel } from "@/components/ui/index-label";
import { cn } from "@/lib/cn";

export function PageHeader({
  index,
  eyebrow,
  title,
  lead,
  actions,
  className,
}: {
  index: string;
  eyebrow: React.ReactNode;
  title: string;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b border-[color:var(--hairline)] pb-8 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        <IndexLabel index={index}>{eyebrow}</IndexLabel>
        <h1 className="mt-4 text-display-md text-[color:var(--text-primary)]">{title}</h1>
        {lead ? (
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">{lead}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

export function SectionTitle({
  children,
  note,
  actions,
  className,
}: {
  children: React.ReactNode;
  note?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-display-sm text-[color:var(--text-primary)]">{children}</h2>
        {note ? <p className="mt-1 text-xs text-[color:var(--text-muted)]">{note}</p> : null}
      </div>
      {actions}
    </div>
  );
}
