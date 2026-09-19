import { cn } from "@/lib/cn";

export function Eyebrow({
  children,
  className,
  withRule = false,
}: {
  children: React.ReactNode;
  className?: string;
  withRule?: boolean;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-[color:var(--accent)]", className)}>
      {withRule ? <span aria-hidden className="h-px w-8 bg-current opacity-50" /> : null}
      <span>{children}</span>
    </p>
  );
}
