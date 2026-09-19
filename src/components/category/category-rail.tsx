import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHead } from "@/components/category/section-head";
import { accentText } from "@/components/category/accent";
import { categories, getCategoryCounts } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { Category, CategorySlug } from "@/types/catalog";

/** Ordered by how often a buyer in the first collection ends up considering the
 *  second — not by taxonomy. */
const SIBLINGS: Record<CategorySlug, CategorySlug[]> = {
  apartments: ["villas", "commercial", "sustainable-living"],
  villas: ["apartments", "plots", "sustainable-living"],
  commercial: ["apartments", "plots", "villas"],
  "sustainable-living": ["spiritual-residences", "villas", "plots"],
  "spiritual-residences": ["sustainable-living", "villas", "plots"],
  plots: ["villas", "sustainable-living", "commercial"],
};

function countLabel(count: number): string {
  if (count === 0) return "In preparation";
  return `${count} ${count === 1 ? "project" : "projects"}`;
}

export function CategoryRail({
  category,
  tone = "dark",
}: {
  category: Category;
  tone?: "dark" | "darker";
}) {
  const counts = getCategoryCounts();
  const siblings = SIBLINGS[category.slug]
    .map((slug) => categories.find((entry) => entry.slug === slug))
    .filter((entry): entry is Category => Boolean(entry))
    .slice(0, 3);

  if (siblings.length === 0) return null;

  return (
    <Section tone={tone} space="lg" aria-labelledby="rail-heading">
      <Container width="wide">
        <SectionHead
          id="rail-heading"
          eyebrow="Other collections"
          title="Most buyers look at two."
          lede={`The brief rarely stays inside one collection. These are the ones most often considered alongside ${category.name}.`}
          accent={category.accent}
          size="md"
        />

        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {siblings.map((sibling) => (
            <RevealItem key={sibling.slug} as="article" className="h-full">
              <Link
                href={`/purchase/${sibling.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-card border border-[color:var(--hairline)] transition-colors duration-500 hover:border-[color:var(--hairline-strong)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-carbon-800">
                  <Image
                    src={sibling.hero.src}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw"
                    className="object-cover transition-transform duration-[900ms] ease-[var(--ease-luxe)] group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-carbon-950/90 via-carbon-950/25 to-transparent"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className={cn("eyebrow tabular", accentText(sibling.accent))}>
                      {sibling.index}
                    </span>
                    <span className="eyebrow text-[color:var(--text-muted)]">
                      {countLabel(counts[sibling.slug])}
                    </span>
                  </div>
                  <h3 className="mt-4 text-display-sm text-[color:var(--text-primary)]">
                    {sibling.name}
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{sibling.tagline}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-[color:var(--text-primary)]">
                    {sibling.cta}
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
