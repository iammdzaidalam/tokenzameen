import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { AdvisoryCta } from "@/components/category/advisory-cta";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { PropertyCard } from "@/components/property/property-card";
import { Reveal, RevealGroup, RevealItem, RevealLines } from "@/components/motion/reveal";
import { DISCLAIMERS } from "@/content/config";
import { categories, getIntent, getProjectsForIntent, intents } from "@/lib/catalog";
import { EMPTY_FILTERS, serializeFilters } from "@/lib/filters";
import { CATEGORY_LABEL } from "@/lib/labels";
import { absoluteUrl } from "@/lib/seo";
import type { IntentSlug } from "@/types/catalog";

export const dynamicParams = false;

interface Framing {
  lede: string;
  points: Array<{ title: string; body: string }>;
  financial?: boolean;
}

const FRAMING: Record<IntentSlug, Framing> = {
  "buy-a-home": {
    lede:
      "A home is bought once and lived in for years, so the decisive questions are the unglamorous ones. These are the three we work through before anything else.",
    points: [
      {
        title: "The commute, not the distance",
        body: "Measure the journey you will actually make, at the hour you will make it, on the road that exists today.",
      },
      {
        title: "The plan on an ordinary weekday",
        body: "Walk the layout against your routine rather than the show home's furniture. Storage, light and circulation decide how a home ages.",
      },
      {
        title: "Who the next buyer is",
        body: "Even a home you never intend to sell is worth buying where somebody else would want to live.",
      },
    ],
  },
  "second-home": {
    lede:
      "A second home is used in weeks rather than years, so most of the risk sits in what happens while you are not there.",
    points: [
      {
        title: "Frequency, honestly",
        body: "How often will you make the trip once the first year is over? The answer changes which location is worth paying for.",
      },
      {
        title: "Upkeep in your absence",
        body: "Who maintains it, who secures it, who lets it, and what that costs every year whether you visit or not.",
      },
      {
        title: "The place out of season",
        body: "Every second-home market has a quiet half of the year. It is worth seeing before you buy into the loud one.",
      },
    ],
  },
  "rental-income": {
    lede:
      "Income property is judged on what a tenant has signed, not on what a brochure projects. Three things decide whether a yield survives.",
    points: [
      {
        title: "Gross against net",
        body: "Vacancy, maintenance, taxes, society dues and brokerage all sit between the headline yield and what reaches you.",
      },
      {
        title: "Who pays the rent",
        body: "Tenant quality is the difference between an income and an assumption. Length of trading matters more than the logo.",
      },
      {
        title: "Re-letting risk",
        body: "How long a unit like this sits empty between tenants in this micro-market, and who is competing for the same tenant.",
      },
    ],
    financial: true,
  },
  "buy-commercial": {
    lede:
      "Commercial real estate is underwritten rather than admired. Almost everything that matters is in the lease, the title and the approvals.",
    points: [
      {
        title: "Lease structure",
        body: "Tenure, lock-in, escalation, notice and who carries the outgoings. The clause governs the number, not the other way around.",
      },
      {
        title: "Catchment",
        body: "What is open and trading around the asset today, as distinct from what has been sanctioned or announced.",
      },
      {
        title: "Exit",
        body: "Who buys a unit of this size and ticket, and how long comparable assets have taken to transact.",
      },
    ],
    financial: true,
  },
  "own-land": {
    lede:
      "Land is a legal purchase before it is a location. Until the title and the approvals hold, nothing else about the plot is worth discussing.",
    points: [
      {
        title: "Title and approvals",
        body: "The chain of ownership and the sanctioned layout, read end to end by somebody who is paid to find the problem.",
      },
      {
        title: "Infrastructure, laid or drawn",
        body: "Roads, water, power, drainage and boundary are either built, funded, or merely on a plan. The three are not the same asset.",
      },
      {
        title: "Horizon",
        body: "What has to happen around the plot for it to be worth holding, who has committed to making it happen, and on whose timeline.",
      },
    ],
  },
  "live-differently": {
    lede:
      "Sustainable and spiritual residences are bought for how a day feels in them, which makes their claims the hardest to verify and the most important to check.",
    points: [
      {
        title: "Designed, not labelled",
        body: "Ask which decisions were taken for the environment before the elevation was drawn, and which were added afterwards.",
      },
      {
        title: "The site as it was found",
        body: "What was kept — contour, tree cover, water — and what was levelled to make the drawing easier.",
      },
      {
        title: "Life between the houses",
        body: "Whether the shared ground is genuinely used at the scale proposed, or only rendered with people in it.",
      },
    ],
  },
};

export function generateStaticParams() {
  return intents.map((intent) => ({ intent: intent.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/discover/[intent]">): Promise<Metadata> {
  const { intent: slug } = await params;
  const intent = getIntent(slug);
  if (!intent) return { title: "Not found" };

  const url = absoluteUrl(`/discover/${intent.slug}`);
  const description = `${intent.description} ${FRAMING[intent.slug].lede}`;

  return {
    title: intent.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${intent.title} · TokenZameen`,
      description,
      url,
      type: "website",
    },
  };
}

export default async function IntentPage({ params }: PageProps<"/discover/[intent]">) {
  const { intent: slug } = await params;
  const intent = getIntent(slug);
  if (!intent) notFound();

  const framing = FRAMING[intent.slug];
  const projects = getProjectsForIntent(intent.slug);
  const index = String(intents.findIndex((entry) => entry.slug === intent.slug) + 1).padStart(2, "0");
  const spanned = categories.filter((category) => intent.categories.includes(category.slug));

  const query = serializeFilters({
    ...EMPTY_FILTERS,
    categories: [...intent.categories],
    purposes: [...intent.purposes],
  }).toString();

  return (
    <>
      <Section tone="bone" space="lg" aria-label={`${intent.title} introduction`}>
        <Container width="wide">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[color:var(--text-secondary)]">
              <li>
                <Link href="/discover" className="transition-colors hover:text-[color:var(--text-primary)]">
                  Discover
                </Link>
              </li>
              <li aria-hidden className="flex items-center">
                <ChevronRight className="size-3.5 opacity-50" />
              </li>
              <li className="text-[color:var(--text-primary)]" aria-current="page">
                {intent.title}
              </li>
            </ol>
          </nav>

          <div className="mt-8">
            <IndexLabel index={index}>Discover by intent</IndexLabel>
          </div>

          <h1 className="mt-6 max-w-[14ch] text-display-2xl text-balance text-[color:var(--text-primary)]">
            <RevealLines lines={[intent.title]} />
          </h1>

          <Reveal mode="fade" delay={0.3} duration={0.8}>
            <p className="mt-8 max-w-2xl text-pretty text-lg text-[color:var(--text-secondary)]">
              {intent.description}
            </p>

            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Collections this intent spans">
              {spanned.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/purchase/${category.slug}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-[color:var(--hairline)] bg-bone-100 px-4 py-2 text-sm text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--text-primary)]"
                  >
                    {CATEGORY_LABEL[category.slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section tone="darker" space="xl" aria-labelledby="framing-heading">
        <Container width="wide">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
            <Reveal>
              <IndexLabel>How we read this brief</IndexLabel>
              <h2 id="framing-heading" className="mt-5 text-balance text-display-lg text-[color:var(--text-primary)]">
                Three questions before the shortlist.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:pt-10">
              <p className="max-w-2xl text-pretty font-display text-2xl leading-snug tracking-tight text-[color:var(--text-primary)] sm:text-3xl">
                {framing.lede}
              </p>
            </Reveal>
          </div>

          <RevealGroup className="mt-14 grid gap-x-10 gap-y-12 border-t border-[color:var(--hairline)] pt-10 sm:mt-20 md:grid-cols-3">
            {framing.points.map((point, position) => (
              <RevealItem key={point.title}>
                <IndexLabel index={String(position + 1).padStart(2, "0")}>Question</IndexLabel>
                <h3 className="mt-4 text-display-sm text-[color:var(--text-primary)]">{point.title}</h3>
                <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]">
                  {point.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>

          {framing.financial ? (
            <p className="mt-14 max-w-3xl border-t border-[color:var(--hairline)] pt-6 text-xs leading-relaxed text-[color:var(--text-muted)]">
              {DISCLAIMERS.financial}
            </p>
          ) : null}
        </Container>
      </Section>

      <Section tone="bone" space="lg" aria-labelledby="matches-heading">
        <Container width="wide">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <Reveal>
              <IndexLabel>What matches today</IndexLabel>
              <h2 id="matches-heading" className="mt-5 text-display-md text-balance text-[color:var(--text-primary)]">
                {projects.length === 0
                  ? "Nothing published against this brief yet."
                  : `${projects.length} ${projects.length === 1 ? "project" : "projects"} in the collection.`}
              </h2>
            </Reveal>

            <Reveal mode="fade" delay={0.15} className="lg:pb-2">
              <Link
                href={`/purchase/properties?${query}`}
                className="group inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--text-primary)] underline decoration-[color:var(--accent)] decoration-1 underline-offset-[6px] transition-opacity duration-300 hover:opacity-70"
              >
                Open these filters in the discovery engine
                <ArrowUpRight className="size-4 text-[color:var(--accent)] transition-transform duration-300 ease-[var(--ease-luxe)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>

          {projects.length === 0 ? (
            <Reveal className="mt-10 rounded-card bg-[color:var(--surface)] p-8 sm:p-10">
              <p className="max-w-2xl text-pretty leading-relaxed text-[color:var(--text-secondary)]">
                Nothing in the published collection answers this brief today, and we would rather say
                so than show you something that nearly fits. Send an advisor the brief and they will
                come back when it does.
              </p>
              <div className="mt-6">
                <Button href={`/advisory?intent=${intent.slug}`} variant="solid" size="md">
                  Send us the brief
                </Button>
              </div>
            </Reveal>
          ) : (
            <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <RevealItem key={project.slug} className="h-full">
                  <PropertyCard project={project} className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          )}

          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
            An intent is a starting point, not a filter you are stuck with. The discovery engine keeps
            these collections and purposes applied so you can widen or narrow them yourself.
          </p>
        </Container>
      </Section>

      <AdvisoryCta tone="paper" href={`/advisory?intent=${intent.slug}`} />
    </>
  );
}
