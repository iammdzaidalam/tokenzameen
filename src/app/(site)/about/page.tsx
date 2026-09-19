import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdvisoryCta } from "@/components/category/advisory-cta";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, RevealGroup, RevealItem, RevealLines } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { SITE } from "@/content/config";
import { categories, getAllProjects } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { absoluteUrl } from "@/lib/seo";

const DESCRIPTION =
  "Don't search through thousands of properties. Discover the ones worth exploring. What TokenZameen is, how the collection is chosen, and what the Verified standard means.";

export const metadata: Metadata = {
  title: "About TokenZameen",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: "About TokenZameen",
    description: DESCRIPTION,
    url: absoluteUrl("/about"),
    type: "website",
  },
};

/** PRD 02, core positioning — what the experience combines. */
const PRINCIPLES = [
  { title: "Luxury real-estate presentation", body: "Each project is presented on its own terms, with room to read it properly." },
  { title: "Curated property discovery", body: "A short list in every collection. Nothing is syndicated in from a feed." },
  { title: "Investment intelligence", body: "A qualitative read on the factors that tend to drive an asset — never a score invented to fill a panel." },
  { title: "AI-assisted property search", body: "Ask in your own words. The answer is built only from what each project has published." },
  { title: "Property comparison", body: "Set properties side by side on the same fields, including the ones that read “on request”." },
  { title: "Site-visit booking", body: "Choose a day and a slot; an advisor confirms the visit with you." },
  { title: "Advisor-assisted acquisition", body: "An advisor is attached to every enquiry." },
  { title: "Verified project information", body: "Six facets checked per project, with the unchecked ones shown as unchecked." },
];

const FACETS = ["Project", "Developer", "Location", "Documentation", "Pricing", "Inventory"];

const COMMITMENTS = [
  {
    title: "No invented figures",
    body: "A price, an area, a yield, a RERA number or a travel time appears only when the project owner has supplied it. Everything else reads “on request” — which means exactly that.",
  },
  {
    title: "Nothing is an offer",
    body: "Figures are indicative and every purchase is a transaction with the project's developer on their published terms. Nothing here is investment, legal or tax advice, and no return is ever guaranteed.",
  },
  {
    title: "Your enquiry goes to a person",
    body: "Every form on the site reaches a TokenZameen property advisor. Where you enquire about a specific property, the enquiry may be shared with its developer so they can respond.",
  },
  {
    title: "Verified means checked, not promised",
    body: "The Verified mark says our team has read the underlying document. It is not a valuation, legal advice, or a guarantee that a project completes on time.",
  },
];

export default function AboutPage() {
  const projects = getAllProjects();
  const totalChecks = projects.length * FACETS.length;
  const confirmed = projects.reduce(
    (sum, project) => sum + Object.values(project.verified).filter(Boolean).length,
    0,
  );
  const latest = projects.map((project) => project.lastUpdated).sort().at(-1) ?? null;

  return (
    <>
      <Section tone="bone" space="none" aria-labelledby="about-heading" className="pb-16 pt-10 sm:pb-24 sm:pt-16">
        <Container width="wide">
          <Eyebrow withRule>About {SITE.name}</Eyebrow>
          <h1 id="about-heading" className="mt-6 max-w-5xl text-balance text-display-xl">
            <RevealLines lines={["Don’t search through thousands of properties.", "Discover the ones worth exploring."]} />
          </h1>
          <Reveal mode="fade" delay={0.3}>
            <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
              {SITE.description}
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="paper" space="lg" aria-labelledby="what-heading">
        <Container width="wide">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-20">
            <Reveal>
              <IndexLabel index="01">What TokenZameen is</IndexLabel>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 id="what-heading" className="max-w-3xl text-balance text-display-md">
                A curated real-estate marketplace: {categories.length} collections, a short list in each, and an
                advisor attached to every enquiry.
              </h2>
              <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-[color:var(--text-secondary)]">
                The Purchase section is built around one idea — that a buyer is better served by a few
                properties presented completely than by thousands presented thinly. Every project page carries
                what the project owner has released, and an explicit list of what is still being compiled.
              </p>
            </Reveal>
          </div>

          <RevealGroup
            as="ol"
            stagger={0.06}
            className="mt-14 grid gap-x-10 border-t border-[color:var(--hairline)] sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
          >
            {PRINCIPLES.map((principle, index) => (
              <RevealItem as="li" key={principle.title} className="border-b border-[color:var(--hairline)] py-7">
                <span className="eyebrow tabular text-[color:var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-base text-[color:var(--text-primary)]">{principle.title}</h3>
                <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  {principle.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section tone="darker" space="xl" aria-labelledby="verified-heading" className="grain">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-20">
            <Reveal>
              <IndexLabel index="02">The Verified standard</IndexLabel>
              <h2 id="verified-heading" className="mt-5 max-w-[14ch] text-balance text-display-lg uppercase">
                Not every property belongs on TokenZameen.
              </h2>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[color:var(--text-secondary)]">
                We aim to bring greater transparency to property discovery by organizing important project,
                developer and property information in one place. Six facets are checked for every project, and
                a facet counts only once our team has read the original document.
              </p>
              <ol className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                {FACETS.map((facet, index) => (
                  <li key={facet} className="border-t border-[color:var(--hairline)] pt-4">
                    <span className="eyebrow tabular text-[color:var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
                    <p className="mt-2 font-display text-base uppercase tracking-tight text-[color:var(--text-primary)]">
                      {facet}
                    </p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="rounded-panel border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] p-6 sm:p-8">
                <dt className="eyebrow text-[color:var(--text-muted)]">Checks confirmed today</dt>
                <dd className="mt-3 font-display text-display-lg tabular text-[color:var(--text-primary)]">
                  <CountUp to={confirmed} />
                  <span className="text-[color:var(--text-muted)]"> / {totalChecks}</span>
                </dd>
                <dd className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  Across {projects.length} projects and {FACETS.length} facets
                  {latest ? `, as of ${formatDate(latest)}` : ""}. The remainder are in progress — shown as
                  in progress, never implied.
                </dd>
                <dd className="mt-6">
                  <Link
                    href="/verified"
                    className="group inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--accent)] transition-opacity hover:opacity-80"
                  >
                    See every project against every facet
                    <ArrowUpRight className="size-4 transition-transform duration-300 ease-[var(--ease-luxe)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </dd>
              </dl>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="bone" space="lg" aria-labelledby="commitments-heading">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-20">
            <Reveal>
              <IndexLabel index="03">How we work</IndexLabel>
              <h2 id="commitments-heading" className="mt-5 text-balance text-display-md">
                Four things you can hold us to.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                The longer versions are in the{" "}
                <Link href="/legal/disclaimer" className="text-[color:var(--accent)] underline-offset-4 hover:underline">
                  disclaimer
                </Link>{" "}
                and the{" "}
                <Link href="/legal/privacy" className="text-[color:var(--accent)] underline-offset-4 hover:underline">
                  privacy policy
                </Link>
                .
              </p>
            </Reveal>

            <RevealGroup as="ul" className="border-t border-[color:var(--hairline)]">
              {COMMITMENTS.map((item) => (
                <RevealItem as="li" key={item.title} className="border-b border-[color:var(--hairline)] py-6">
                  <h3 className="font-display text-lg text-[color:var(--text-primary)]">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-[color:var(--text-secondary)]">
                    {item.body}
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
