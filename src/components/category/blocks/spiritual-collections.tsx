import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHead } from "@/components/category/section-head";
import { accentRule, accentText } from "@/components/category/accent";
import { cn } from "@/lib/cn";
import type { Accent } from "@/components/category/accent";

const COLLECTIONS = [
  {
    title: "Pilgrimage Residences",
    description: "Homes near significant pilgrimage destinations",
    note: "Proximity is read practically here: how you arrive, how often you would, and what the town is like in the weeks it fills.",
  },
  {
    title: "Wellness Residences",
    description: "Homes designed around wellness and retreat living",
    note: "Built around rest, where the rhythm of an ordinary day is planned as carefully as the floor plan.",
  },
  {
    title: "Meditation Communities",
    description: "Communities built around mindfulness and contemplation",
    note: "Quiet as a planning decision — sound, light and circulation arranged so stillness is actually available.",
  },
  {
    title: "Nature Retreats",
    description: "Residences surrounded by natural landscapes",
    note: "Landscape first. The house is placed to keep whatever made the site worth choosing.",
  },
];

export function SpiritualCollections({ accent }: { accent: Accent }) {
  return (
    <Section tone="light" space="xl" aria-labelledby="collections-heading">
      <Container width="wide">
        <SectionHead
          id="collections-heading"
          eyebrow="The collections"
          title="Four ways a residence can hold its quiet."
          lede="Spiritual Residences is being assembled around four kinds of home. None of them is defined by a tradition; each is defined by what daily life in that place is actually like."
          accent={accent}
          tone="light"
          quiet
          align="center"
          className="mx-auto max-w-3xl"
        />

        <RevealGroup
          stagger={0.2}
          delay={0.1}
          className="mx-auto mt-20 max-w-5xl border-t border-[color:var(--hairline)] sm:mt-28"
        >
          {COLLECTIONS.map((collection, index) => (
            <RevealItem
              key={collection.title}
              mode="fade"
              className="grid gap-6 border-b border-[color:var(--hairline)] py-12 sm:py-16 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16"
            >
              <div>
                <span className={cn("eyebrow tabular", accentText(accent, "light"))}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-2xl font-normal tracking-tight text-[color:var(--text-primary)] sm:text-[1.75rem]">
                  {collection.title}
                </h3>
              </div>
              <div className="lg:pt-8">
                <p className="text-pretty text-lg leading-relaxed text-[color:var(--text-primary)] sm:text-xl">
                  {collection.description}.
                </p>
                <p className="mt-5 max-w-xl text-pretty text-sm leading-loose text-[color:var(--text-secondary)]">
                  {collection.note}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal mode="fade" duration={1.1} className="mx-auto mt-16 max-w-2xl text-center sm:mt-20">
          <span aria-hidden className={cn("mx-auto block h-px w-12", accentRule(accent, "light"))} />
          <p className="mt-8 text-pretty text-sm leading-loose text-[color:var(--text-secondary)]">
            This collection stays inclusive by design. We describe what is nearby and what a place is
            like to live in, plainly, and leave what it means to you.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
