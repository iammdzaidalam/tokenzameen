import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { AdvisoryCta } from "@/components/category/advisory-cta";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
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
  const index = intents.findIndex((entry) => entry.slug === intent.slug) + 1;
  const spanned = categories.filter((category) => intent.categories.includes(category.slug));

  const query = serializeFilters({
    ...EMPTY_FILTERS,
    categories: [...intent.categories],
    purposes: [...intent.purposes],
  }).toString();

  return (
    <>
      <Section
        tone="dark"
        space="none"
        aria-label={`${intent.title} introduction`}
        className="grain pb-20 pt-[calc(72px+4.5rem)] sm:pb-24 sm:pt-[calc(72px+7rem)]"
      >
        <Container width="wide">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-steel-300">
              <li>
                <Link href="/discover" className="transition-colors hover:text-bone-100">
                  Discover
                </Link>
              </li>
              <li aria-hidden className="flex items-center">
                <ChevronRight className="size-3.5 opacity-50" />
              </li>
              <li className="text-bone-100" aria-current="page">
                {intent.title}
              </li>
            </ol>
          </nav>

          <div className="mt-8">
            <Eyebrow>
              {String(index).padStart(2, "0")} — Discover by intent
            </Eyebrow>
          </div>

          <h1 className="mt-6 max-w-4xl text-display-xl text-balance">
            <RevealLines lines={[intent.title]} />
          </h1>

          <Reveal mode="fade" delay={0.3} duration={0.8}>
            <p className="mt-8 max-w-2xl text-pretty text-lg text-steel-200">{intent.description}</p>

            <ul className="mt-10 flex flex-wrap gap-2">
              {spanned.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/purchase/${category.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-steel-200 transition-colors hover:border-gold-400/50 hover:text-bone-100"
                  >
                    {CATEGORY_LABEL[category.slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section tone="light" space="lg" aria-labelledby="framing-heading">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow withRule>How we read this brief</Eyebrow>
              <h2 id="framing-heading" className="mt-5 text-balance text-display-md">
                Three questions before the shortlist.
              </h2>
              <p className="mt-6 max-w-xl text-pretty leading-relaxed text-[color:var(--text-secondary)]">
                {framing.lede}
              </p>
            </Reveal>

            <RevealGroup className="border-t border-[color:var(--hairline)]">
              {framing.points.map((point, pointIndex) => (
                <RevealItem
                  key={point.title}
                  className="grid gap-x-8 gap-y-2 border-b border-[color:var(--hairline)] py-7 md:grid-cols-[3.5rem_minmax(0,1fr)]"
                >
                  <span className="eyebrow tabular text-[color:var(--accent)]">
                    {String(pointIndex + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-display-sm text-[color:var(--text-primary)]">{point.title}</h3>
                    <p className="mt-3 max-w-2xl text-pretty text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]">
                      {point.body}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          {framing.financial ? (
            <p className="mt-12 max-w-3xl border-t border-[color:var(--hairline)] pt-6 text-xs leading-relaxed text-[color:var(--text-muted)]">
              {DISCLAIMERS.financial}
            </p>
          ) : null}
        </Container>
      </Section>

      <Section tone="darker" space="lg" aria-labelledby="matches-heading">
        <Container width="wide">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <Reveal>
              <Eyebrow withRule>What matches today</Eyebrow>
              <h2 id="matches-heading" className="mt-5 text-display-md text-balance">
                {projects.length === 0
                  ? "Nothing published against this brief yet."
                  : `${projects.length} ${projects.length === 1 ? "project" : "projects"} in the collection.`}
              </h2>
            </Reveal>

            <Reveal mode="fade" delay={0.15}>
              <Link
                href={`/purchase/properties?${query}`}
                className="group inline-flex items-center gap-2 text-sm text-[color:var(--accent)] underline-offset-[6px] transition-opacity hover:underline hover:opacity-80"
              >
                Open these filters in the discovery engine
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>

          {projects.length === 0 ? (
            <Reveal className="mt-10 rounded-panel border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] p-8 sm:p-10">
              <p className="max-w-2xl text-pretty leading-relaxed text-[color:var(--text-secondary)]">
                Nothing in the published collection answers this brief today, and we would rather say
                so than show you something that nearly fits. Send an advisor the brief and they will
                come back when it does.
              </p>
              <div className="mt-6">
                <Button href={`/advisory?intent=${intent.slug}`} variant="secondary" size="md">
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

      <AdvisoryCta href={`/advisory?intent=${intent.slug}`} />
    </>
  );
}
