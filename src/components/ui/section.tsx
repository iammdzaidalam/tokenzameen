import { cn } from "@/lib/cn";

type Tone = "dark" | "darker" | "light" | "transparent";
type Space = "none" | "sm" | "md" | "lg" | "xl";

const TONES: Record<Tone, string> = {
  dark: "bg-carbon-900 text-bone-100",
  darker: "bg-carbon-950 text-bone-100",
  light: "bg-bone-100 text-carbon-900",
  transparent: "",
};

const SPACES: Record<Space, string> = {
  none: "",
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-24",
  lg: "py-20 sm:py-32",
  xl: "py-24 sm:py-40",
};

export function Section({
  children,
  className,
  tone = "dark",
  space = "lg",
  id,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: Tone;
  space?: Space;
  id?: string;
  "aria-label"?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      data-surface={tone === "light" ? "light" : "dark"}
      className={cn("relative", TONES[tone], SPACES[space], className)}
    >
      {children}
    </section>
  );
}
