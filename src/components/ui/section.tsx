import { cn } from "@/lib/cn";

type Tone = "paper" | "bone" | "light" | "dark" | "darker" | "transparent";
type Space = "none" | "sm" | "md" | "lg" | "xl";

const TONES: Record<Tone, string> = {
  paper: "bg-white text-carbon-900",
  bone: "bg-bone-100 text-carbon-900",
  light: "bg-bone-100 text-carbon-900",
  dark: "bg-carbon-900 text-bone-100",
  darker: "bg-carbon-950 text-bone-100",
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
  tone = "bone",
  space = "lg",
  id,
  rounded = false,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: Tone;
  space?: Space;
  id?: string;
  rounded?: boolean;
  "aria-label"?: string;
}) {
  const dark = tone === "dark" || tone === "darker";
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      data-surface={dark ? "dark" : "light"}
      className={cn(
        "relative",
        TONES[tone],
        SPACES[space],
        rounded && "rounded-frame",
        className,
      )}
    >
      {children}
    </section>
  );
}
