import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function TileArrow({
  className,
  size = "md",
  tone = "solid",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "solid" | "glass" | "accent";
}) {
  const sizes = { sm: "size-9", md: "size-11", lg: "size-14" };
  const tones = {
    solid: "bg-carbon-900 text-bone-100",
    glass: "glass text-carbon-900",
    accent: "bg-gold-400 text-carbon-950",
  };
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:rotate-45",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      <ArrowUpRight className={size === "sm" ? "size-4" : "size-5"} />
    </span>
  );
}
