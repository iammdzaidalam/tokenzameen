import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";
import { categories } from "@/lib/catalog";
import { cn } from "@/lib/cn";

const SHAPES = [
  "lg:col-span-7 lg:h-[30rem] xl:h-[34rem]",
  "lg:col-span-5 lg:h-[24rem] lg:self-end xl:h-[27rem]",
  "lg:col-span-5 lg:h-[26rem] lg:self-end xl:h-[29rem]",
  "lg:col-span-7 lg:h-[32rem] xl:h-[36rem]",
  "lg:col-span-7 lg:h-[30rem] xl:h-[34rem]",
  "lg:col-span-5 lg:h-[24rem] lg:self-end xl:h-[27rem]",
];

export function CategoryCollections() {
  return (
    <Section id="collections" tone="bone" aria-label="What are you looking for" space="xl">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <IndexLabel index="02">The collections</IndexLabel>
              <h2 className="mt-6 max-w-[16ch] text-display-lg uppercase text-[color:var(--text-primary)]">
                What are you looking for?
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[color:var(--text-secondary)] lg:pb-3 lg:text-right">
              <CountUp to={categories.length} className="tabular text-[color:var(--text-primary)]" />{" "}
              collections, each with its own way of reading a property.
            </p>
          </div>
        </Reveal>

        <RevealGroup
          stagger={0.09}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-12 lg:gap-6"
        >
          {categories.map((category, index) => (
            <RevealItem
              key={category.slug}
              className={cn(
                "aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto",
                SHAPES[index % SHAPES.length],
              )}
            >
              <Link
                href={`/purchase/${category.slug}`}
                className="group relative block h-full w-full overflow-hidden rounded-card bg-carbon-850 transition-[transform,box-shadow] duration-500 ease-[var(--ease-luxe)] hover:-translate-y-1.5 hover:shadow-lift"
              >
                <Image
                  src={category.hero.src}
                  alt={category.hero.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-luxe)] group-hover:scale-[1.07]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-carbon-950 via-carbon-950/40 to-carbon-950/5"
                />

                <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                  <span className="eyebrow text-bone-100/70">{category.index}</span>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-display-md text-bone-50">{category.name}</h3>
                      <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-bone-200/85">
                        {category.tagline}
                      </p>
                      <span className="mt-5 inline-block text-[0.8125rem] text-bone-100/80 underline decoration-bone-100/30 underline-offset-[6px]">
                        {category.cta}
                      </span>
                    </div>
                    <TileArrow tone="glass" />
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
