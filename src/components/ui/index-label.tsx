import { cn } from "@/lib/cn";

export function IndexLabel({
  index,
  children,
  className,
  dot = true,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-2 text-[color:var(--text-muted)]", className)}>
      {dot ? (
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
      ) : null}
      {index ? (
        <span className="tabular text-[color:var(--accent)]">/{index}</span>
      ) : null}
      <span>{children}</span>
    </p>
  );
}
