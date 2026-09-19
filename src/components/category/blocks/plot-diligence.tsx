import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { SectionHead } from "@/components/category/section-head";
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
    body: "Land pays for patience, so the question is what has to happen around the plot for it to be worth holding: who has committed to it, what is funded, and on whose timeline.",
  },
];

export function PlotDiligence({ accent, index }: { accent: Accent; index: string }) {
  return (
    <Section tone="darker" space="xl" aria-labelledby="land-heading">
      <Container width="wide">
        <AccentScope accent={accent} tone="dark">
          <SectionHead
            index={index}
            id="land-heading"
            eyebrow="What land turns on"
            title="A plot is a legal question before it is a location."
            lede="Buying land is the simplest transaction in real estate and the easiest to get wrong. Five things decide whether a plot is worth owning, and none of them are visible from the site."
          />

          <RevealGroup className="mt-14 grid gap-x-8 gap-y-12 border-t border-[color:var(--hairline)] pt-10 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CHECKS.map((check, position) => (
              <RevealItem key={check.title}>
                <IndexLabel index={String(position + 1).padStart(2, "0")}>Check</IndexLabel>
                <h3 className="mt-4 text-display-sm text-[color:var(--text-primary)]">{check.title}</h3>
                <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]">
                  {check.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>

          <p className="mt-16 max-w-3xl border-t border-[color:var(--hairline)] pt-6 text-sm leading-relaxed text-[color:var(--text-secondary)]">
            Each plotted development below lists what its owner has supplied and what is still being
            compiled. Where a document has not reached us, the page says so rather than implying it
            exists.
          </p>
        </AccentScope>
      </Container>
    </Section>
  );
}
