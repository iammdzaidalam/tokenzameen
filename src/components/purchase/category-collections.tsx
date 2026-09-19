import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
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
    <Section id="collections" aria-label="What are you looking for" space="xl">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow withRule>The Collections</Eyebrow>
              <h2 className="mt-6 max-w-[16ch] text-display-lg uppercase">
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
                className="group relative block h-full w-full overflow-hidden rounded-panel border border-[color:var(--hairline)] bg-carbon-850 transition-[transform,border-color] duration-500 ease-[var(--ease-luxe)] hover:-translate-y-1.5 hover:border-[color:var(--hairline-strong)]"
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
                  <span className="eyebrow text-gold-300/90">{category.index}</span>
                  <div>
                    <h3 className="text-display-md text-bone-50">{category.name}</h3>
                    <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-steel-200">
                      {category.tagline}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm text-gold-200">
                      {category.cta}
                      <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
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
