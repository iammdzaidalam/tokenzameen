import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PropertyCard } from "@/components/property/property-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHead } from "@/components/category/section-head";
import { accentText } from "@/components/category/accent";
import { cn } from "@/lib/cn";
import type { Accent } from "@/components/category/accent";
import type { Project } from "@/types/catalog";

const PILLARS = [
  {
    title: "Green Architecture",
    body: "Orientation, massing and envelope settled before the elevation is drawn, so the building works before anything is bolted on.",
  },
  {
    title: "Natural Landscapes",
    body: "The contour, the tree cover and the water that were there first, kept where they can be kept rather than levelled and replanted.",
  },
  {
    title: "Energy Efficiency",
    body: "Demand reduced first — shading, insulation, daylight — and only then met with generation and recovery.",
  },
  {
    title: "Water Management",
    body: "Rainwater, wastewater and recharge planned as one system, with the monsoon treated as a design input rather than a drainage problem.",
  },
  {
    title: "Community Living",
    body: "Shared ground that people actually cross, at a scale where neighbours remain recognisable.",
  },
  {
    title: "Wellness",
    body: "Air, daylight, quiet and the ability to walk somewhere, treated as specifications rather than adjectives.",
  },
];

export function SustainablePillars({
  accent,
  featured,
}: {
  accent: Accent;
  featured: Project | null;
}) {
  return (
    <Section tone="light" space="lg" aria-labelledby="pillars-heading">
      <Container width="wide">
        <SectionHead
          id="pillars-heading"
          eyebrow="The six pillars"
          title="Built around a better future."
          lede="Sustainability is claimed far more often than it is designed. These are the six things we look for, and the vocabulary an advisor will use when they walk you through a project in this collection."
          accent={accent}
          tone="light"
          className="[&_h2]:uppercase"
        />

        <RevealGroup className="mt-14 grid gap-px overflow-hidden rounded-panel border border-[color:var(--hairline)] bg-[color:var(--hairline)] sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <RevealItem
              key={pillar.title}
              className="bg-[color:var(--surface-raised)] p-7 sm:p-8"
            >
              <span className={cn("eyebrow tabular", accentText(accent, "light"))}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl uppercase tracking-tight text-[color:var(--text-primary)]">
                {pillar.title}
              </h3>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-[color:var(--text-secondary)]">
                {pillar.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>

        {featured ? (
          <div className="mt-16 sm:mt-20">
            <Reveal>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--hairline)] pt-8">
                <Eyebrow withRule className={accentText(accent, "light")}>
                  Featured in this collection
                </Eyebrow>
                <p className="text-sm text-[color:var(--text-secondary)]">{featured.positioning}</p>
              </div>
            </Reveal>
            <Reveal delay={0.12} className="mt-8">
              <PropertyCard project={featured} variant="feature" />
            </Reveal>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
