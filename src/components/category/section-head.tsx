import { IndexLabel } from "@/components/ui/index-label";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

export function SectionHead({
  index,
  eyebrow,
  title,
  lede,
  align = "start",
  size = "lg",
  quiet = false,
  className,
  id,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "start" | "center";
  size?: "lg" | "md";
  quiet?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <Reveal duration={quiet ? 1 : 0.7} className={cn(align === "center" && "text-center", className)}>
      <IndexLabel index={index} className={cn(align === "center" && "justify-center")}>
        {eyebrow}
      </IndexLabel>
      <h2
        id={id}
        className={cn(
          "mt-5 text-balance text-[color:var(--text-primary)]",
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
