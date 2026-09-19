import type { Metadata } from "next";
import Link from "next/link";
import { AdvisoryCta } from "@/components/category/advisory-cta";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";
import { Reveal, RevealGroup, RevealItem, RevealLines } from "@/components/motion/reveal";
import { getProjectsForIntent, intents } from "@/lib/catalog";
import { CATEGORY_LABEL } from "@/lib/labels";
import { absoluteUrl } from "@/lib/seo";

const DESCRIPTION =
  "Six ways to start a property search from the outcome you want rather than the property type you think you need.";

export const metadata: Metadata = {
  title: "Discover by intent",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/discover") },
  openGraph: {
    title: "Discover by intent · TokenZameen",
    description: DESCRIPTION,
    url: absoluteUrl("/discover"),
    type: "website",
  },
};

export default function DiscoverPage() {
  const entries = intents.map((intent) => ({
    intent,
    count: getProjectsForIntent(intent.slug).length,
  }));

  return (
    <>
      <Section tone="bone" space="lg" aria-label="Discover by intent introduction">
        <Container width="wide">
          <IndexLabel>Discover</IndexLabel>
          <h1 className="mt-6 max-w-[14ch] text-display-2xl text-balance text-[color:var(--text-primary)]">
            <RevealLines lines={["What are you looking", "to achieve?"]} />
          </h1>
          <Reveal mode="fade" delay={0.3} duration={0.8}>
            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-20">
              <p className="text-pretty text-lg leading-relaxed text-[color:var(--text-secondary)]">
                Most property portals organise around property type. We also organise around why
                someone is buying, because the brief usually crosses three collections before it
                settles in one.
              </p>
              <p className="max-w-md text-pretty text-sm leading-relaxed text-[color:var(--text-muted)] lg:self-end lg:justify-self-end lg:text-right">
                Don&rsquo;t search through thousands of properties. Discover the ones worth exploring.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="darker" space="xl" aria-labelledby="intents-heading">
        <Container width="wide">
          <h2 id="intents-heading" className="sr-only">
            The six intents
          </h2>
          <RevealGroup as="ol" className="border-t border-[color:var(--hairline)]">
            {entries.map(({ intent, count }, index) => (
              <RevealItem as="li" key={intent.slug} className="border-b border-[color:var(--hairline)]">
                <Link
                  href={`/discover/${intent.slug}`}
                  className="group grid gap-x-10 gap-y-5 py-10 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,16rem)_auto] md:items-center md:py-14 lg:py-16"
                >
                  <span className="eyebrow tabular text-[color:var(--accent)]">
                    /{String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3 className="text-display-lg text-balance text-[color:var(--text-primary)] transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-x-1">
                      {intent.title}
                    </h3>
                    <p className="mt-4 max-w-md text-base text-[color:var(--text-secondary)]">
                      {intent.description}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <p className="text-sm text-[color:var(--text-secondary)]">
                      {intent.categories.map((slug) => CATEGORY_LABEL[slug]).join(" · ")}
                    </p>
                    <p className="eyebrow mt-3 text-[color:var(--text-muted)]">
                      {count === 0
                        ? "In preparation"
                        : `${count} ${count === 1 ? "project" : "projects"}`}
                    </p>
                  </div>

                  <TileArrow tone="accent" className="md:justify-self-end" />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal mode="fade" className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Counts are what is published today across the whole collection. An intent with nothing in
              it says so rather than showing you something that nearly fits.
            </p>
            <Button href="/purchase/properties" variant="secondary" size="md" className="w-full sm:w-auto">
              Browse every property instead
            </Button>
          </Reveal>
        </Container>
      </Section>

      <AdvisoryCta tone="paper" />
    </>
  );
}
