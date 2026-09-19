import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdvisoryCta } from "@/components/category/advisory-cta";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
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
      <Section tone="dark" space="none" className="grain pb-20 pt-[calc(72px+5rem)] sm:pb-28 sm:pt-[calc(72px+8rem)]">
        <Container width="wide">
          <Eyebrow withRule>Discover</Eyebrow>
          <h1 className="mt-6 max-w-5xl text-display-2xl text-balance">
            <RevealLines lines={["What are you looking", "to achieve?"]} />
          </h1>
          <Reveal mode="fade" delay={0.3} duration={0.8}>
            <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-20">
              <p className="max-w-xl text-pretty text-lg leading-relaxed text-steel-200">
                Most property portals organise around property type. We also organise around why
                someone is buying, because the brief usually crosses three collections before it
                settles in one.
              </p>
              <p className="max-w-md text-pretty text-sm leading-relaxed text-steel-300 lg:self-end">
                Don&rsquo;t search through thousands of properties. Discover the ones worth exploring.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="darker" space="lg" aria-labelledby="intents-heading">
        <Container width="wide">
          <h2 id="intents-heading" className="sr-only">
            The six intents
          </h2>
          <RevealGroup className="border-t border-[color:var(--hairline)]">
            {entries.map(({ intent, count }, index) => (
              <RevealItem key={intent.slug}>
                <Link
                  href={`/discover/${intent.slug}`}
                  className="group grid gap-x-10 gap-y-4 border-b border-[color:var(--hairline)] py-9 transition-colors duration-500 hover:bg-white/[0.02] md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,18rem)_2rem] md:items-baseline md:py-12"
                >
                  <span className="eyebrow tabular text-[color:var(--accent)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3 className="text-display-md text-balance text-[color:var(--text-primary)]">
                      {intent.title}
                    </h3>
                    <p className="mt-3 max-w-md text-base text-[color:var(--text-secondary)]">
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

                  <ArrowUpRight
                    aria-hidden
                    className="size-6 text-[color:var(--text-muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)] md:justify-self-end"
                  />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal mode="fade" className="mt-10">
            <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Counts are what is published today across the whole collection. An intent with nothing in
              it says so rather than showing you something that nearly fits.{" "}
              <Link
                href="/purchase/properties"
                className="text-[color:var(--accent)] underline-offset-4 hover:underline"
              >
                Browse every property instead
              </Link>
              .
            </p>
          </Reveal>
        </Container>
      </Section>

      <AdvisoryCta />
    </>
  );
}
