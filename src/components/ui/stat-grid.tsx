import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/cn";

export interface Stat {
  value: number | string;
  suffix?: string;
  label: string;
  note?: string;
}

/**
 * Hairline cells with one inverted block, after the reference boards. The
 * inverted cell is an editorial device, so it is chosen by index rather than by
 * meaning.
 */
export function StatGrid({
  stats,
  invertIndex = 1,
  columns = 4,
  className,
}: {
  stats: Stat[];
  invertIndex?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const cols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <dl className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-card bg-[color:var(--hairline)]", cols, className)}>
      {stats.map((stat, index) => {
        const inverted = index === invertIndex;
        return (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col justify-between gap-6 p-6 sm:p-8",
              inverted ? "invert-block" : "bg-[color:var(--surface)]",
            )}
          >
            <dd
              className={cn(
                "font-display text-display-md leading-none tracking-tight",
                inverted ? "text-[color:var(--invert-text)]" : "text-[color:var(--text-primary)]",
              )}
            >
              {typeof stat.value === "number" ? (
                <CountUp to={stat.value} suffix={stat.suffix ?? ""} />
              ) : (
                <>
                  {stat.value}
                  {stat.suffix ?? ""}
                </>
              )}
            </dd>
            <div>
              <dt
                className={cn(
                  "text-sm",
                  inverted ? "text-bone-300/80" : "text-[color:var(--text-secondary)]",
                )}
              >
                {stat.label}
              </dt>
              {stat.note ? (
                <p className={cn("mt-1 text-xs", inverted ? "text-steel-400" : "text-[color:var(--text-muted)]")}>
                  {stat.note}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </dl>
  );
}
