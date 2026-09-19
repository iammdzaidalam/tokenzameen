import Link from "next/link";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { SectionHead } from "@/components/category/section-head";
import { accentTile, type Accent } from "@/components/category/accent";

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

export function SpiritualCollections({ accent, index }: { accent: Accent; index: string }) {
  return (
    <Section tone="darker" space="xl" aria-labelledby="collections-heading">
      <Container width="wide">
        <AccentScope accent={accent} tone="dark">
          <SectionHead
            index={index}
            id="collections-heading"
            eyebrow="The collections"
            title="Four ways a residence can hold its quiet."
            lede="Spiritual Residences is being assembled around four kinds of home. None of them is defined by a tradition; each is defined by what daily life in that place is actually like."
            quiet
            align="center"
            className="mx-auto max-w-3xl"
          />

          <RevealGroup
            stagger={0.18}
            delay={0.1}
            className="mx-auto mt-16 grid max-w-6xl gap-5 sm:mt-24 md:grid-cols-2"
          >
            {COLLECTIONS.map((collection, position) => (
              <RevealItem key={collection.title} mode="fade" as="article" className="h-full">
                <Link
                  href="#collection"
                  aria-label={`${collection.title}: register your interest`}
                  className="group flex h-full flex-col justify-between rounded-card bg-[color:var(--surface-raised)] p-7 transition-[transform,background-color] duration-700 ease-[var(--ease-luxe)] hover:-translate-y-1 sm:p-9"
                >
                  <div>
                    <IndexLabel index={String(position + 1).padStart(2, "0")}>Collection</IndexLabel>
                    <h3 className="mt-6 font-display text-2xl font-normal tracking-tight text-[color:var(--text-primary)] sm:text-[1.75rem]">
                      {collection.title}
                    </h3>
                    <p className="mt-4 text-pretty text-base leading-relaxed text-[color:var(--text-primary)] sm:text-lg">
                      {collection.description}.
                    </p>
                    <p className="mt-4 max-w-md text-pretty text-sm leading-loose text-[color:var(--text-secondary)]">
                      {collection.note}
                    </p>
                  </div>
                  <div className="mt-10 flex items-center justify-between gap-6">
                    <span className="text-sm text-[color:var(--text-secondary)]">Register your interest</span>
                    <TileArrow className={accentTile(accent)} />
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal mode="fade" duration={1.1} className="mx-auto mt-16 max-w-2xl text-center sm:mt-20">
            <span aria-hidden className="mx-auto block h-px w-12 bg-[color:var(--accent)] opacity-60" />
            <p className="mt-8 text-pretty text-sm leading-loose text-[color:var(--text-secondary)]">
              This collection stays inclusive by design. We describe what is nearby and what a place is
              like to live in, plainly, and leave what it means to you.
            </p>
          </Reveal>
        </AccentScope>
      </Container>
    </Section>
  );
}
