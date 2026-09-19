import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Tint = "sage" | "gold" | "steel" | "lotus";

const TINT: Record<Tint, string> = {
  sage: "bg-tint-sage",
  gold: "bg-tint-gold",
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

/**
 * Board 01's tinted stat card: a big count, its label, and a share bar that is
 * only rendered when the card has an honest denominator to show against. A
 * `null` value means the count could not be read, and says so.
 */
export function MetricCard({
  label,
  value,
  tint,
  share,
  note,
  href,
  className,
}: {
  label: string;
  value: number | null;
  tint: Tint;
  share?: { of: number | null; label: string };
  note?: string;
  href?: string;
  className?: string;
}) {
  const ratio =
    value !== null && share && share.of !== null && share.of > 0 ? Math.min(1, value / share.of) : null;
  const percent = ratio === null ? null : Math.round(ratio * 100);

  const body = (
    <>
      <Contours />
      <div className="relative flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-[color:var(--text-secondary)]">{label}</p>
        {href ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-carbon-900/15 text-carbon-900 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:rotate-45">
            <ArrowUpRight aria-hidden className="size-3.5" />
          </span>
        ) : null}
      </div>
      <p className="tabular relative mt-6 font-display text-display-lg leading-none tracking-tight text-carbon-900">
        {value === null ? "—" : value.toLocaleString("en-IN")}
      </p>
      <div className="relative mt-6">
        {value === null ? (
          <p className="text-xs text-signal-danger">This count could not be read. See the server log.</p>
        ) : ratio !== null && share ? (
          <>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent ?? 0}
              aria-label={`${label}: ${percent}% ${share.label}`}
              className="h-1.5 w-full overflow-hidden rounded-full bg-carbon-900/10"
            >
              <div
                className="h-full rounded-full bg-carbon-900"
                style={{ width: `${(ratio * 100).toFixed(1)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[color:var(--text-secondary)]">
              <span className="tabular font-medium text-carbon-900">{percent}%</span> {share.label}
            </p>
          </>
        ) : note ? (
          <p className="text-xs text-[color:var(--text-secondary)]">{note}</p>
        ) : null}
      </div>
    </>
  );

  const classes = cn(
    "group relative isolate flex min-h-[13rem] flex-col justify-between overflow-hidden rounded-card p-6 transition-transform duration-500 ease-[var(--ease-luxe)]",
    TINT[tint],
    href && "hover:-translate-y-0.5",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return <div className={classes}>{body}</div>;
}
