import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { SectionHead } from "@/components/category/section-head";
import { categories, getCategoryCounts } from "@/lib/catalog";
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

export function CategoryRail({ category, index }: { category: Category; index: string }) {
  const counts = getCategoryCounts();
  const siblings = SIBLINGS[category.slug]
    .map((slug) => categories.find((entry) => entry.slug === slug))
    .filter((entry): entry is Category => Boolean(entry))
    .slice(0, 3);

  if (siblings.length === 0) return null;

  return (
    <Section tone="paper" space="lg" aria-labelledby="rail-heading">
      <Container width="wide">
        <AccentScope accent={category.accent} tone="light">
          <SectionHead
            index={index}
            id="rail-heading"
            eyebrow="Other collections"
            title="Worth reading side by side."
            lede={`The brief rarely stays inside one collection. These are the ones that sit naturally alongside ${category.name}.`}
            size="md"
          />

          <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((sibling) => (
              <RevealItem key={sibling.slug} as="article" className="h-full">
                <Link
                  href={`/purchase/${sibling.slug}`}
                  data-surface="dark"
                  className="group relative block aspect-[4/5] overflow-hidden rounded-card bg-carbon-950 sm:aspect-[5/6]"
                >
                  <Image
                    src={sibling.hero.src}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw"
                    className="object-cover transition-transform duration-[1100ms] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-carbon-950/90 via-carbon-950/30 to-carbon-950/10"
                  />

                  <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <span className="eyebrow tabular text-[color:var(--text-primary)] opacity-80">/{sibling.index}</span>
                      <span className="eyebrow text-[color:var(--text-primary)] opacity-70">{countLabel(counts[sibling.slug])}</span>
                    </div>
                    <div className="flex items-end justify-between gap-6">
                      <div>
                        <h3 className="text-display-sm text-[color:var(--text-primary)]">{sibling.name}</h3>
                        <p className="mt-2 max-w-[26ch] text-sm text-[color:var(--text-secondary)]">{sibling.tagline}</p>
                      </div>
                      <TileArrow tone="glass" />
                    </div>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </AccentScope>
      </Container>
    </Section>
  );
}
