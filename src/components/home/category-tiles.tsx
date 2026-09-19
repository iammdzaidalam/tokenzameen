import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";
import { categories, getCategoryCounts } from "@/lib/catalog";

export function CategoryTiles() {
  const counts = getCategoryCounts();

  return (
    <Section tone="bone" space="lg" aria-labelledby="collections-heading" className="pt-0 sm:pt-4">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <IndexLabel index="02">The collections</IndexLabel>
              <h2 id="collections-heading" className="mt-5 max-w-[14ch] text-balance text-display-lg">
                Six ways to read a property.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[color:var(--text-secondary)] lg:pb-2 lg:text-right">
              Each collection has its own questions, its own audience and its own page.
            </p>
          </div>
        </Reveal>

        <RevealGroup as="ul" stagger={0.07} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const count = counts[category.slug];
            return (
              <RevealItem as="li" key={category.slug}>
                <Link
                  href={`/purchase/${category.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-panel bg-carbon-850 sm:aspect-[5/6]"
                >
                  <Image
                    src={category.hero.src}
                    alt={category.hero.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1100ms] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-carbon-950 via-carbon-950/35 to-carbon-950/5"
                  />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="eyebrow text-gold-300/90">/{category.index}</span>
                      <TileArrow tone="glass" size="sm" />
                    </div>
                    <div>
                      <h3 className="text-display-sm text-bone-50">{category.name}</h3>
                      <p className="mt-1.5 max-w-[26ch] text-sm text-steel-200">{category.tagline}</p>
                      <p className="mt-4 text-xs text-bone-200/70">
                        {count === 0
                          ? "Nothing listed yet"
                          : `${count} ${count === 1 ? "property" : "properties"} in the collection`}
                      </p>
                    </div>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
