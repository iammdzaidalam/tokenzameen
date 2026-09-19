import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { cn } from "@/lib/cn";
import type { Category, CategorySlug } from "@/types/catalog";

const LEDE: Record<CategorySlug, string> = {
  apartments:
    "A collection is assembled around a buyer, not a floor plate. These are the briefs this one is meant to answer.",
  villas:
    "Villas attract a particular kind of brief — more land, fewer neighbours, a longer stay. These are the ones this collection answers.",
  commercial:
    "Every enquiry in this collection begins with an income question rather than a lifestyle one. These are the briefs it answers.",
  "sustainable-living":
    "This collection is for buyers who read the site plan before the elevation. These are the briefs it answers.",
  "spiritual-residences":
    "This collection is defined by how a place feels to live in rather than by any one tradition. These are the briefs it is being assembled around.",
  plots:
    "Land rewards patience and punishes assumptions. These are the briefs this collection answers.",
};

export function CategoryAudience({
  category,
  index,
  quiet = false,
}: {
  category: Category;
  index: string;
  quiet?: boolean;
}) {
  return (
    <Section tone="paper" space={quiet ? "xl" : "lg"} aria-labelledby="audience-heading">
      <Container width="wide">
        <AccentScope accent={category.accent} tone="light">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-20">
            <Reveal duration={quiet ? 1 : 0.7}>
              <IndexLabel index={index}>Who this is for</IndexLabel>
              <h2 id="audience-heading" className="sr-only">
                Who this is for
              </h2>
            </Reveal>

            <div>
              <Reveal duration={quiet ? 1 : 0.7}>
                <p
                  className={cn(
                    "max-w-3xl text-pretty font-display text-2xl leading-snug tracking-tight text-[color:var(--text-primary)] sm:text-3xl lg:text-[2.5rem] lg:leading-[1.15]",
                    quiet && "font-normal leading-normal lg:leading-[1.3]",
                  )}
                >
                  {LEDE[category.slug]}
                </p>
              </Reveal>

              <RevealGroup
                as="ul"
                stagger={quiet ? 0.14 : 0.07}
                className="mt-12 border-t border-[color:var(--hairline)] sm:mt-16"
              >
                {category.audience.map((item, position) => (
                  <RevealItem
                    as="li"
                    key={item}
                    className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-[color:var(--hairline)] py-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:py-6"
                  >
                    <IndexLabel index={String(position + 1).padStart(2, "0")} dot={false}>
                      Brief
                    </IndexLabel>
                    <span
                      className={cn(
                        "text-pretty font-display text-lg text-[color:var(--text-primary)] sm:text-xl",
                        quiet && "font-normal",
                      )}
                    >
                      {item}
                    </span>
                  </RevealItem>
                ))}
              </RevealGroup>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <p className="max-w-md text-sm text-[color:var(--text-secondary)]">
                  Brief not on this list? An advisor will tell you plainly whether this collection holds
                  anything for you.
                </p>
                <Button href="/advisory" variant="link" size="sm">
                  Talk to an advisor
                </Button>
              </div>
            </div>
          </div>
        </AccentScope>
      </Container>
    </Section>
  );
}
