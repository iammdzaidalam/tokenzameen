import { Hourglass, Info } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
  size = "lg",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
  size?: "lg" | "md";
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <Eyebrow withRule>{eyebrow}</Eyebrow>
      <h2 className={cn("mt-5", size === "lg" ? "text-display-lg" : "text-display-md")}>{title}</h2>
      {lead ? (
        <p className="mt-5 text-base leading-relaxed text-[color:var(--text-secondary)]">{lead}</p>
      ) : null}
    </div>
  );
}

export function Panel({
  children,
  className,
  tone = "raised",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "raised" | "outline";
}) {
  return (
    <div
      className={cn(
        "rounded-panel border border-[color:var(--hairline)] p-6 sm:p-8",
        tone === "raised" && "bg-[color:var(--surface-raised)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * The single designed treatment for "this is not published yet". Every section
 * that has no data renders one of these rather than an empty container.
 */
export function PendingPanel({
  title,
  body,
  items,
  itemsLabel,
  action,
  className,
}: {
  title: string;
  body: string;
  items?: string[];
  itemsLabel?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-[color:var(--hairline-strong)] text-[color:var(--accent)]"
        >
          <Hourglass className="size-4" />
        </span>
        <div>
          <h3 className="font-subhead text-base font-medium text-[color:var(--text-primary)]">{title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[color:var(--text-secondary)]">{body}</p>
        </div>
      </div>

      {items && items.length > 0 ? (
        <div className="border-t border-[color:var(--hairline)] pt-6">
          {itemsLabel ? (
            <p className="eyebrow text-[color:var(--text-muted)]">{itemsLabel}</p>
          ) : null}
          <ul className="mt-4 flex flex-wrap gap-2">
            {items.map((item) => (
              <li
                key={item}
                className="rounded-full border border-dashed border-[color:var(--hairline-strong)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </Panel>
  );
}

export function Disclaimer({
  children,
  className,
  label = "Important",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] p-4",
        className,
      )}
    >
      <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-[color:var(--accent)]" />
      <p className="text-xs leading-relaxed text-[color:var(--text-secondary)]">
        <span className="sr-only">{label}: </span>
        {children}
      </p>
    </div>
  );
}

export function StatTile({
  label,
  value,
  note,
  emphasis = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <dt className="eyebrow text-[color:var(--text-muted)]">{label}</dt>
      <dd
        className={cn(
          "tabular font-display leading-tight text-[color:var(--text-primary)]",
          emphasis ? "text-display-sm" : "text-xl",
        )}
      >
        {value}
      </dd>
      {note ? <p className="text-xs text-[color:var(--text-muted)]">{note}</p> : null}
    </div>
  );
}
