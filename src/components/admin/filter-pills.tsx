import Link from "next/link";
import { cn } from "@/lib/cn";

export interface PillOption {
  value: string;
  label: string;
}

export function withParam(base: URLSearchParams, key: string, value: string | null): string {
  const next = new URLSearchParams(base);
  if (value === null || value === "") next.delete(key);
  else next.set(key, value);
  next.delete("page");
  const query = next.toString();
  return query ? `?${query}` : "?";
}

export function Pill({
  href,
  active,
  children,
  className,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[0.8125rem] transition-colors duration-300 ease-[var(--ease-luxe)]",
        active
          ? "border-carbon-900 bg-carbon-900 text-bone-100"
          : "border-[color:var(--hairline)] bg-bone-100 text-carbon-900 hover:border-[color:var(--hairline-strong)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Each pill is a link, so filtering works without JavaScript and every state
 * has a URL the team can share.
 */
export function FilterPills({
  label,
  param,
  options,
  current,
  base,
  allLabel = "All",
}: {
  label: string;
  param: string;
  options: PillOption[];
  /** The selected values. Several can be active at once when the URL carries a comma-separated list. */
  current: readonly string[];
  base: URLSearchParams;
  allLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
        {label}
      </p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <Pill href={withParam(base, param, null)} active={current.length === 0}>
          {allLabel}
        </Pill>
        {options.map((option) => (
          <Pill
            key={option.value}
            href={withParam(base, param, option.value)}
            active={current.includes(option.value)}
          >
            {option.label}
          </Pill>
        ))}
      </div>
    </div>
  );
}
