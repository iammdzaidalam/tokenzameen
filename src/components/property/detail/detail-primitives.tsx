import { Hourglass, Info } from "lucide-react";
import { IndexLabel } from "@/components/ui/index-label";
import { cn } from "@/lib/cn";

export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  className,
  size = "lg",
}: {
  index?: string;
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
  size?: "lg" | "md";
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <IndexLabel index={index}>{eyebrow}</IndexLabel>
      <h2
        className={cn(
          "mt-5 text-balance text-[color:var(--text-primary)]",
          size === "lg" ? "text-display-lg" : "text-display-md",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p className="mt-5 text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
          {lead}
        </p>
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
  tone?: "raised" | "outline" | "glass";
}) {
  return (
    <div
      className={cn(
        "rounded-panel p-6 sm:p-8",
        tone === "raised" && "border border-[color:var(--hairline)] bg-[color:var(--surface)]",
        tone === "outline" && "border border-[color:var(--hairline)]",
        tone === "glass" && "glass",
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
          className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--surface-sunken)] text-[color:var(--accent)]"
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
          {itemsLabel ? <p className="eyebrow text-[color:var(--text-muted)]">{itemsLabel}</p> : null}
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
        "flex gap-3 rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-4",
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

export type Tint = "gold" | "sage" | "steel" | "lotus";

const TINT: Record<Tint, string> = {
  gold: "bg-tint-gold",
  sage: "bg-tint-sage",
  steel: "bg-tint-steel",
  lotus: "bg-tint-lotus",
};

function Contours() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 200"
      className="pointer-events-none absolute -right-10 -top-6 h-[140%] w-auto text-carbon-900 opacity-[0.07]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M40 180c40-70 90-80 130-50s60 20 110-40" />
      <path d="M20 170c50-90 110-100 160-60s70 10 120-60" />
      <path d="M0 160c60-110 130-120 190-70s80 0 130-80" />
      <path d="M60 190c30-50 70-60 100-35s50 15 90-25" />
      <path d="M80 200c20-30 50-40 75-25s40 10 70-20" />
    </svg>
  );
}

/** Board 01's tinted metric card. Always on a light surface, so its ink is fixed carbon. */
export function TintCard({
  label,
  value,
  note,
  tint = "steel",
  emphasis = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
  tint?: Tint;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex flex-col justify-between gap-5 overflow-hidden rounded-card p-5 sm:p-6",
        TINT[tint],
        className,
      )}
    >
      <Contours />
      <dt className="relative text-sm font-medium text-carbon-500">{label}</dt>
      <div className="relative">
        <dd
          className={cn(
            "tabular font-display leading-none tracking-tight text-carbon-900",
            emphasis ? "text-display-lg" : "text-display-sm",
          )}
        >
          {value}
        </dd>
        {note ? <p className="mt-3 text-xs text-carbon-500">{note}</p> : null}
      </div>
    </div>
  );
}
