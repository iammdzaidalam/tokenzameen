import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";
import { getCategory, intents } from "@/lib/catalog";

export function IntentIndex() {
  return (
    <Section id="intent" tone="paper" aria-label="Discover by intent" space="xl">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <IndexLabel index="06">Discover by intent</IndexLabel>
              <h2 className="mt-6 max-w-[15ch] text-display-lg uppercase text-[color:var(--text-primary)]">
                What are you looking to achieve?
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--text-secondary)] lg:pb-3 lg:text-right">
              Most portals organise around property type. We also organise around why someone is
              buying.
            </p>
          </div>
        </Reveal>

        <RevealGroup
          as="ol"
          stagger={0.06}
          className="mt-14 border-t border-[color:var(--hairline)] lg:mt-20"
        >
          {intents.map((intent, index) => {
            const artwork = getCategory(intent.categories[0]);
            return (
              <RevealItem
                as="li"
                key={intent.slug}
                className="border-b border-[color:var(--hairline)]"
              >
                <Link
                  href={`/discover/${intent.slug}`}
                  className="group relative flex items-center gap-5 py-7 sm:gap-8 sm:py-9 lg:py-11"
                >
                  <span className="eyebrow tabular w-8 shrink-0 text-[color:var(--accent)]">
                    /{String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-display-sm text-[color:var(--text-primary)] transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-x-1 sm:text-display-md">
                      {intent.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                      {intent.description}
                    </p>
                  </div>

                  {artwork ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-24 top-1/2 hidden h-24 w-40 -translate-y-1/2 translate-x-4 overflow-hidden rounded-xl opacity-0 transition-all duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-0 group-hover:opacity-100 lg:block"
                    >
                      <Image
                        src={artwork.hero.src}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </span>
                  ) : null}

                  <TileArrow size="sm" tone="solid" className="relative" />
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal>
          <Button href="/discover" variant="secondary" size="lg" className="mt-10">
            See every starting point
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
