import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-[color:var(--hairline)] bg-white text-[color:var(--text-primary)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  note,
  actions,
  className,
}: {
  title: React.ReactNode;
  note?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--hairline)] px-6 py-5",
        className,
      )}
    >
      <div>
        <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
        {note ? <p className="mt-1 text-xs text-[color:var(--text-muted)]">{note}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function Notice({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warning" | "danger" | "success";
  className?: string;
}) {
  const tones = {
    neutral: "border-[color:var(--hairline)] bg-bone-100 text-[color:var(--text-secondary)]",
    warning: "border-signal-warning/40 bg-signal-warning/10 text-carbon-900",
    danger: "border-signal-danger/40 bg-signal-danger/10 text-carbon-900",
    success: "border-signal-success/40 bg-signal-success/10 text-carbon-900",
  }[tone];
  return (
    <p className={cn("rounded-xl border px-4 py-3 text-xs leading-relaxed", tones, className)}>
      {children}
    </p>
  );
}

export function DefinitionList({
  items,
  className,
}: {
  items: Array<{ term: string; value: React.ReactNode }>;
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-[color:var(--hairline)]", className)}>
      {items.map((item) => (
        <div key={item.term} className="grid gap-1 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {item.term}
          </dt>
          <dd className="text-sm text-[color:var(--text-primary)]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
