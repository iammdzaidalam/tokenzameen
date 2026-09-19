import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHead } from "@/components/category/section-head";
import { accentRule, accentText } from "@/components/category/accent";
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
  quiet = false,
}: {
  category: Category;
  quiet?: boolean;
}) {
  return (
    <Section tone="darker" space={quiet ? "xl" : "lg"} aria-labelledby="audience-heading">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
          <SectionHead
            id="audience-heading"
            eyebrow="Who this is for"
            title={quiet ? "Who this is for" : "Who this is for."}
            lede={LEDE[category.slug]}
            accent={category.accent}
            size="md"
            quiet={quiet}
            className="lg:sticky lg:top-28 lg:self-start"
          />

          <div>
            <RevealGroup as="ul" stagger={quiet ? 0.14 : 0.07} className="border-t border-[color:var(--hairline)]">
              {category.audience.map((item, index) => (
                <RevealItem
                  as="li"
                  key={item}
                  className="flex items-baseline gap-5 border-b border-[color:var(--hairline)] py-5 sm:gap-8 sm:py-7"
                >
                  <span className={cn("eyebrow shrink-0 tabular", accentText(category.accent))}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-pretty font-display text-xl text-[color:var(--text-primary)] sm:text-2xl",
                      quiet && "font-normal",
                    )}
                  >
                    {item}
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-4">
              <span aria-hidden className={cn("h-px w-10", accentRule(category.accent, "dark"))} />
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
      </Container>
    </Section>
  );
}
