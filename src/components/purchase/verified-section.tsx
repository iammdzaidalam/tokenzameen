import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
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
    <Section id="verified" tone="light" aria-label="TokenZameen Verified" space="xl">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal>
            <Eyebrow withRule>TokenZameen Verified</Eyebrow>
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
            <Link
              href="/verified"
              className="group mt-7 inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--text-primary)] underline decoration-[color:var(--accent)] decoration-1 underline-offset-[6px] transition-opacity duration-300 hover:opacity-70"
            >
              How TokenZameen Verified works
              <ArrowUpRight className="size-4 text-[color:var(--accent)] transition-transform duration-300 ease-[var(--ease-luxe)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
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
              <span className="eyebrow tabular text-[color:var(--accent)]">{facet.index}</span>
              <h3 className="mt-4 text-display-sm text-[color:var(--text-primary)]">
                {facet.title}
              </h3>
              <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-[color:var(--text-secondary)]">
                {facet.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
