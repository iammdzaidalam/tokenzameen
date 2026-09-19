import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";
import { accentText, type Accent, type Tone } from "@/components/category/accent";

export function SectionHead({
  eyebrow,
  title,
  lede,
  accent,
  tone = "dark",
  align = "start",
  size = "lg",
  quiet = false,
  className,
  id,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  accent: Accent;
  tone?: Tone;
  align?: "start" | "center";
  size?: "lg" | "md";
  quiet?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <Reveal duration={quiet ? 1 : 0.7} className={cn(align === "center" && "text-center", className)}>
      <Eyebrow withRule={align === "start"} className={cn(accentText(accent, tone), align === "center" && "justify-center")}>
        {eyebrow}
      </Eyebrow>
      <h2
        id={id}
        className={cn(
          "mt-5 text-balance",
          size === "lg" ? "text-display-lg" : "text-display-md",
          quiet && "font-normal",
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg",
            align === "center" && "mx-auto",
            quiet && "mt-7 leading-loose",
          )}
        >
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}
