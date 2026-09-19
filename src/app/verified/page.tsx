import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { AdvisoryCta } from "@/components/category/advisory-cta";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { ScoreBar } from "@/components/ui/score-bar";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, RevealGroup, RevealItem, RevealLines } from "@/components/motion/reveal";
import { DISCLAIMERS } from "@/content/config";
import { getAllProjects } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { absoluteUrl } from "@/lib/seo";
import type { VerifiedFacets } from "@/types/catalog";

const DESCRIPTION =
  "We aim to bring greater transparency to property discovery by organizing important project, developer and property information in one place.";

export const metadata: Metadata = {
  title: "TokenZameen Verified",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/verified") },
  openGraph: {
    title: "TokenZameen Verified",
    description: DESCRIPTION,
    url: absoluteUrl("/verified"),
    type: "website",
  },
};

type FacetKey = keyof VerifiedFacets;

interface Facet {
  key: FacetKey;
  title: string;
  meaning: string;
  checked: string;
  ask: string;
  note?: string;
}

const FACETS: Facet[] = [
  {
    key: "project",
    title: "Project",
    meaning:
      "What the project actually is: its name, category, status, the developer selling it and the claim it makes about itself, recorded in one place and dated.",
    checked:
      "We confirm the project exists as described and that the description carried here matches the developer's own material rather than a listing site's summary.",
    ask: "Ask where any statement on a project page came from. It is either in a document we hold or it is marked as being compiled.",
  },
  {
    key: "developer",
    title: "Developer",
    meaning:
      "The entity behind the project, how long it has been trading, and what it has completed before this.",
    checked:
      "We confirm the developer's identity, and its delivery record where that record can be established. This is the facet most often still open, because a track record takes longer to establish than a name.",
    ask: "Ask who the developer is, what else they have finished, and in which year each one was handed over.",
  },
  {
    key: "location",
    title: "Location",
    meaning:
      "Where the project is, precisely, and what genuinely surrounds it today rather than what is planned for it.",
    checked:
      "We confirm the location as described. Coordinates, distances and travel times appear only where they have been surveyed or supplied by the project owner — they are never estimated to fill a gap.",
    ask: "Ask for the exact address, and for what is already built within the distances you are being quoted.",
  },
  {
    key: "documentation",
    title: "Documentation",
    meaning:
      "The paper behind the claims: RERA registration, sanctions and approvals, title, brochure, floor plans, payment plan and, for a commercial asset, the lease.",
    checked:
      "A document counts as verified only once our team has read the original. Until then the project page lists it as awaited, and a gated document is released on request rather than implied.",
    ask: "Ask for the RERA number and the approvals before any money moves, including a booking amount.",
  },
  {
    key: "pricing",
    title: "Pricing",
    meaning:
      "What it costs in full: the starting price, the payment plan, and the charges that sit outside the headline — taxes, parking, maintenance, registration.",
    checked:
      "We publish a price only when the developer has released a rate we can stand behind. Everywhere else reads “Price on request”, which means what it says: we do not know yet, so we will not guess.",
    ask: "Ask for the complete cost sheet rather than the starting price.",
  },
  {
    key: "inventory",
    title: "Inventory",
    meaning:
      "What is actually left: which units, floors or plots are available, at what size, at what status, as of when.",
    checked:
      "Verified inventory means a live availability sheet from the developer. Where a project page shows an indicative layout to demonstrate how selection works, it is labelled as indicative on the page itself.",
    ask: "Ask for the availability sheet dated the day you decide, not the one circulated last quarter.",
    note: DISCLAIMERS.sampleInventory,
  },
];

export default function VerifiedPage() {
  const projects = getAllProjects();
  const totalChecks = projects.length * FACETS.length;
  const confirmedChecks = projects.reduce(
    (sum, project) => sum + FACETS.filter((facet) => project.verified[facet.key]).length,
    0,
  );
  const tally = Object.fromEntries(
    FACETS.map((facet) => [facet.key, projects.filter((project) => project.verified[facet.key]).length]),
  ) as Record<FacetKey, number>;

  return (
    <>
      <Section
        tone="dark"
        space="none"
        aria-label="TokenZameen Verified introduction"
        className="grain pb-20 pt-[calc(72px+5rem)] sm:pb-28 sm:pt-[calc(72px+8rem)]"
      >
        <Container width="wide">
          <Eyebrow withRule>TokenZameen Verified</Eyebrow>
          <h1 className="mt-6 max-w-5xl text-display-2xl text-balance">
            <RevealLines lines={["Not every property", "belongs on TokenZameen."]} />
          </h1>

          <Reveal mode="fade" delay={0.3} duration={0.8}>
            <p className="mt-10 max-w-2xl text-pretty text-lg leading-relaxed text-steel-200">
              {DESCRIPTION}
            </p>

            <dl className="mt-14 grid gap-px overflow-hidden rounded-panel border border-white/10 bg-white/10 sm:grid-cols-3">
              <div className="bg-carbon-900 p-6 sm:p-7">
                <dt className="eyebrow text-steel-400">Projects listed</dt>
                <dd className="mt-3 font-display text-display-md tabular text-bone-100">
                  <CountUp to={projects.length} />
                </dd>
              </div>
              <div className="bg-carbon-900 p-6 sm:p-7">
                <dt className="eyebrow text-steel-400">Facets confirmed</dt>
                <dd className="mt-3 font-display text-display-md tabular text-bone-100">
                  <CountUp to={confirmedChecks} />
                  <span className="text-steel-400"> / {totalChecks}</span>
                </dd>
              </div>
              <div className="bg-carbon-900 p-6 sm:p-7">
                <dt className="eyebrow text-steel-400">Still in progress</dt>
                <dd className="mt-3 font-display text-display-md tabular text-bone-100">
                  <CountUp to={totalChecks - confirmedChecks} />
                </dd>
              </div>
            </dl>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-steel-300">
              Those last two numbers are the point of this page. Verification is a standard we hold
              ourselves to, not a badge we award ourselves — so where a check has not been done, we say
              so here rather than leaving you to assume it has.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="darker" space="lg" aria-labelledby="facets-heading">
        <Container width="wide">
          <Reveal>
            <Eyebrow withRule>The six facets</Eyebrow>
            <h2 id="facets-heading" className="mt-5 max-w-3xl text-balance text-display-lg">
              Six things we check, and what each one buys you.
            </h2>
            <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-[color:var(--text-secondary)]">
              Every project on TokenZameen is measured against the same six facets. Each one below
              says what it means in practice, what we do before it counts as confirmed, and what you
              are entitled to ask for as a result.
            </p>
          </Reveal>

          <RevealGroup className="mt-14 border-t border-[color:var(--hairline)] sm:mt-16">
            {FACETS.map((facet, index) => (
              <RevealItem
                key={facet.key}
                className="grid gap-x-10 gap-y-6 border-b border-[color:var(--hairline)] py-10 lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,19rem)] lg:py-12"
              >
                <span className="eyebrow tabular text-[color:var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3 className="text-display-sm uppercase tracking-tight text-[color:var(--text-primary)]">
                    {facet.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-pretty text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]">
                    {facet.meaning}
                  </p>
                  <p className="mt-4 max-w-2xl text-pretty text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]">
                    {facet.checked}
                  </p>
                  <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-[color:var(--text-primary)]">
                    <span className="eyebrow mr-3 text-[color:var(--text-muted)]">Ask for</span>
                    {facet.ask}
                  </p>
                  {facet.note ? (
                    <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[color:var(--text-muted)]">
                      {facet.note}
                    </p>
                  ) : null}
                </div>

                <div className="lg:pt-2">
                  <ScoreBar
                    label="Confirmed across the collection"
                    value={tally[facet.key]}
                    max={projects.length}
                  />
                  <p className="mt-4 text-xs leading-relaxed text-[color:var(--text-muted)]">
                    {tally[facet.key] === 0
                      ? "Not yet confirmed on any project in the collection."
                      : `Confirmed on ${tally[facet.key]} of ${projects.length} projects. The remainder are in progress, not implied.`}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section tone="light" space="lg" aria-labelledby="matrix-heading">
        <Container width="wide">
          <Reveal>
            <Eyebrow withRule>Where the collection stands</Eyebrow>
            <h2 id="matrix-heading" className="mt-5 max-w-3xl text-balance text-display-md">
              Every project, every facet, as of today.
            </h2>
            <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-[color:var(--text-secondary)]">
              A project carries the TokenZameen Verified mark once at least three of the six facets are
              confirmed. That mark is not a statement about the other three, so here is the whole
              table instead.
            </p>
            <p className="mt-4 text-xs text-[color:var(--text-muted)] sm:hidden">
              Scroll the table sideways to see all six facets.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <div
              role="region"
              aria-label="Verification status by project"
              tabIndex={0}
              className="overflow-x-auto"
            >
            <table className="w-full min-w-[46rem] border-collapse text-left">
              <caption className="sr-only">
                Verification status of each published project against the six TokenZameen Verified
                facets
              </caption>
              <thead>
                <tr className="border-b border-[color:var(--hairline-strong)]">
                  <th scope="col" className="eyebrow py-4 pr-6 text-[color:var(--text-muted)]">
                    Project
                  </th>
                  {FACETS.map((facet) => (
                    <th
                      key={facet.key}
                      scope="col"
                      className="eyebrow px-3 py-4 text-center text-[color:var(--text-muted)]"
                    >
                      {facet.title}
                    </th>
                  ))}
                  <th scope="col" className="eyebrow py-4 pl-6 text-right text-[color:var(--text-muted)]">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.slug} className="border-b border-[color:var(--hairline)]">
                    <th scope="row" className="py-5 pr-6 font-display text-base font-medium">
                      <Link
                        href={`/purchase/${project.slug}`}
                        className="text-[color:var(--text-primary)] underline-offset-4 hover:underline"
                      >
                        {project.name}
                      </Link>
                      <span className="mt-1 block text-xs font-normal text-[color:var(--text-secondary)]">
                        {project.location.label}
                      </span>
                    </th>
                    {FACETS.map((facet) => {
                      const confirmed = project.verified[facet.key];
                      return (
                        <td key={facet.key} className="px-3 py-5 text-center">
                          {confirmed ? (
                            <Check aria-hidden className="mx-auto size-4 text-[color:var(--accent)]" />
                          ) : (
                            <Minus aria-hidden className="mx-auto size-4 text-[color:var(--text-muted)]" />
                          )}
                          <span className="sr-only">
                            {facet.title}: {confirmed ? "confirmed" : "in progress"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-5 pl-6 text-right text-xs tabular text-[color:var(--text-secondary)]">
                      {formatDate(project.lastUpdated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Reveal>

          <p className="mt-6 text-sm text-[color:var(--text-secondary)]">
            A dash means the check has not been completed. It is not a judgement on the project, and it
            is not a quiet way of saying something failed — it means we have not read the document yet.
          </p>
        </Container>
      </Section>

      <Section tone="dark" space="lg" aria-labelledby="limits-heading">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
            <Reveal>
              <Eyebrow withRule>The limits</Eyebrow>
              <h2 id="limits-heading" className="mt-5 text-balance text-display-md">
                What Verified does not mean.
              </h2>
            </Reveal>

            <RevealGroup as="ul" className="border-t border-[color:var(--hairline)]">
              {[
                {
                  title: "It is not a valuation",
                  body: "Confirming a price was published is not the same as saying it is the right price. What something is worth is your judgement, and your valuer's.",
                },
                {
                  title: "It is not legal advice",
                  body: "We read documents so that the page is accurate. You should still have your own lawyer read the title and the agreement before you sign.",
                },
                {
                  title: "It is not a guarantee of delivery",
                  body: "No amount of documentation makes a project certain to complete on time. We tell you what has been approved, not what will happen.",
                },
                {
                  title: "It is not permanent",
                  body: "Approvals lapse, inventory moves, prices change. Every project page carries the date it was last updated, and a check is only as good as that date.",
                },
              ].map((limit) => (
                <RevealItem
                  as="li"
                  key={limit.title}
                  className="border-b border-[color:var(--hairline)] py-6"
                >
                  <h3 className="font-display text-lg text-[color:var(--text-primary)]">
                    {limit.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-[color:var(--text-secondary)]">
                    {limit.body}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Container>
      </Section>

      <AdvisoryCta />
    </>
  );
}
