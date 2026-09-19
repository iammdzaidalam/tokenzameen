import { cn } from "@/lib/cn";

export function IndexLabel({
  index,
  children,
  className,
  dot = true,
  as: Tag = "p",
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
  as?: "p" | "span" | "div" | "h2" | "h3" | "h4";
}) {
  return (
    <Tag className={cn("eyebrow flex items-center gap-2 text-[color:var(--text-muted)]", className)}>
      {dot ? (
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
      ) : null}
      {index ? (
        <span className="tabular text-[color:var(--accent)]">/{index}</span>
      ) : null}
      <span>{children}</span>
    </Tag>
  );
}
