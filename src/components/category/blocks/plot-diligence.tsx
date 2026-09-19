import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHead } from "@/components/category/section-head";
import { accentText } from "@/components/category/accent";
import { cn } from "@/lib/cn";
import type { Accent } from "@/components/category/accent";

const CHECKS = [
  {
    title: "Title",
    body: "Who owns the land, how they came to own it, and whether the chain survives a lawyer reading it end to end. Title is the one part of a land purchase that cannot be corrected afterwards.",
  },
  {
    title: "Approvals",
    body: "What the land is permitted to be used for, which authority sanctioned the layout, and whether the plan on the brochure is the plan that was approved.",
  },
  {
    title: "Infrastructure status",
    body: "Roads, drainage, water, power, boundary. Each of them is either laid, funded or merely drawn — and the distance between those three is where most plot disappointments begin.",
  },
  {
    title: "Road access",
    body: "How the plot is actually reached, how wide that access is, whether it is recorded in the sanctioned layout, and who is obliged to maintain it in ten years.",
  },
  {
    title: "Horizon",
    body: "Land pays for patience, so the question is what has to happen around the plot for it to be worth holding: who has committed to it, what is funded, and on whose timeline. A plot bought for a horizon nobody is working towards is simply a long wait.",
    wide: true,
  },
];

export function PlotDiligence({ accent }: { accent: Accent }) {
  return (
    <Section tone="light" space="lg" aria-labelledby="land-heading">
      <Container width="wide">
        <SectionHead
          id="land-heading"
          eyebrow="What land turns on"
          title="A plot is a legal question before it is a location."
          lede="Buying land is the simplest transaction in real estate and the easiest to get wrong. Five things decide whether a plot is worth owning, and none of them are visible from the site."
          accent={accent}
          tone="light"
        />

        <RevealGroup className="mt-14 grid gap-x-12 gap-y-10 sm:mt-16 md:grid-cols-2 lg:gap-x-20">
          {CHECKS.map((check, index) => (
            <RevealItem
              key={check.title}
              className={cn(
                "border-t border-[color:var(--hairline)] pt-6",
                check.wide && "md:col-span-2",
              )}
            >
              <div className="flex items-baseline gap-4">
                <span className={cn("eyebrow tabular", accentText(accent, "light"))}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-display-sm text-[color:var(--text-primary)]">{check.title}</h3>
              </div>
              <p
                className={cn(
                  "mt-4 text-pretty text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]",
                  check.wide && "max-w-3xl",
                )}
              >
                {check.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="mt-14 max-w-3xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
          Each plotted development below lists what its owner has supplied and what is still being
          compiled. Where a document has not reached us, the page says so rather than implying it
          exists.
        </p>
      </Container>
    </Section>
  );
}
