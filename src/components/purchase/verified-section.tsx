import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";

const FACETS = [
  {
    index: "01",
    title: "Project",
    body: "Category, configurations, availability and status, kept in one record with the date it was last updated.",
  },
  {
    index: "02",
    title: "Developer",
    body: "Who is building it, and what the developer has shared about itself.",
  },
  {
    index: "03",
    title: "Location",
    body: "Where the project actually sits, described in the terms a buyer needs rather than a marketing radius.",
  },
  {
    index: "04",
    title: "Documentation",
    body: "Which documents exist, which can be shared with you, and which are still being compiled.",
  },
  {
    index: "05",
    title: "Pricing",
    body: "Published pricing where the owner has released it. Where they have not, the price stays on request.",
  },
  {
    index: "06",
    title: "Inventory",
    body: "What is available, what is held and what has gone, read against the developer's released inventory.",
  },
];

export function VerifiedSection() {
  return (
    <Section id="verified" tone="dark" aria-label="TokenZameen Verified" space="xl">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal>
            <IndexLabel index="04">TokenZameen Verified</IndexLabel>
            <h2 className="mt-6 max-w-[13ch] text-display-lg uppercase text-[color:var(--text-primary)]">
              Not every property belongs on TokenZameen.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="lg:pt-16">
            <p className="text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
              We aim to bring greater transparency to property discovery by organizing important
              project, developer and property information in one place.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              TokenZameen organises what a project owner supplies and records what is still missing.
              Where a fact has not been independently checked, we say so rather than mark it
              verified.
            </p>
            <Button href="/verified" variant="secondary" size="md" className="mt-8">
              How TokenZameen Verified works
            </Button>
          </Reveal>
        </div>

        <RevealGroup
          as="ol"
          stagger={0.07}
          className="mt-14 grid gap-x-10 border-t border-[color:var(--hairline)] sm:grid-cols-2 lg:mt-20 lg:grid-cols-3"
        >
          {FACETS.map((facet) => (
            <RevealItem
              as="li"
              key={facet.index}
              className="border-b border-[color:var(--hairline)] py-8"
            >
              <h3 className="flex flex-col gap-3">
                <span className="eyebrow tabular text-[color:var(--accent)]">/{facet.index}</span>
                <span className="text-display-sm text-[color:var(--text-primary)]">
                  {facet.title}
                </span>
              </h3>
              <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-[color:var(--text-secondary)]">
                {facet.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
