import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium leading-none transition-colors",
  {
    variants: {
      tone: {
        neutral: "border-[color:var(--hairline)] bg-white/5 text-[color:var(--text-secondary)]",
        gold: "border-gold-400/35 bg-gold-400/12 text-gold-200",
        sage: "border-sage-400/35 bg-sage-400/12 text-sage-300",
        lotus: "border-lotus-400/35 bg-lotus-400/12 text-lotus-300",
        success: "border-signal-success/40 bg-signal-success/12 text-signal-success",
        warning: "border-signal-warning/40 bg-signal-warning/12 text-signal-warning",
        danger: "border-signal-danger/40 bg-signal-danger/12 text-signal-danger",
        outline: "border-[color:var(--hairline-strong)] bg-transparent text-[color:var(--text-primary)]",
      },
      size: {
        sm: "px-2.5 py-1 text-[0.6875rem]",
        md: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  },
);

export function Badge({
  children,
  className,
  tone,
  size,
}: VariantProps<typeof badge> & { children: React.ReactNode; className?: string }) {
  return <span className={cn(badge({ tone, size }), className)}>{children}</span>;
}
