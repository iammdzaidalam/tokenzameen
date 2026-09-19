import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { AdvisorJourney } from "@/components/advisor/journey";
import { AdvisorSection } from "@/components/advisor/advisor-section";
import { FormPrefill } from "@/components/advisor/form-prefill";
import { SiteVisitPlanner } from "@/components/advisor/site-visit-planner";
import { AdvisoryForm, EnquiryForm } from "@/components/forms";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { getAllProjects, getIntent, getProject } from "@/lib/catalog";
import { CATEGORY_LABEL } from "@/lib/labels";
import { absoluteUrl } from "@/lib/seo";

const DESCRIPTION =
  "Tell us your requirements. Our property advisors will help you navigate the TokenZameen collection.";

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function generateMetadata({ searchParams }: PageProps<"/advisory">): Promise<Metadata> {
  const params = await searchParams;
  const personalised = Boolean(first(params.project) || first(params.request) || first(params.intent));
  return {
    title: "Talk to an Advisor",
    description: DESCRIPTION,
    alternates: { canonical: absoluteUrl("/advisory") },
    robots: personalised ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: "Talk to an Advisor · TokenZameen",
      description: DESCRIPTION,
      url: absoluteUrl("/advisory"),
      type: "website",
    },
  };
}

/**
 * Query contract, honoured from every other page:
 *   ?project=<slug>       pre-selects the property
 *   ?request=site-visit   opens the site-visit booking instead of the enquiry form
 *   ?intent=<intent-slug> pre-selects purpose and category on the advisory form
 *   #ai                   scrolls to the AI advisor
 */
export default async function AdvisoryPage({ searchParams }: PageProps<"/advisory">) {
  const params = await searchParams;
  const projectSlug = first(params.project);
  const project = projectSlug ? getProject(projectSlug) : null;
  const intent = first(params.intent) ? getIntent(first(params.intent) ?? "") : null;
  const siteVisit = first(params.request) === "site-visit";
  const unknownProject = Boolean(projectSlug) && project === null;
  const properties = getAllProjects().map((entry) => ({ slug: entry.slug, name: entry.name }));

  const switchHref = siteVisit
    ? project
      ? `/advisory?project=${encodeURIComponent(project.slug)}`
      : "/advisory"
    : project
      ? `/advisory?project=${encodeURIComponent(project.slug)}&request=site-visit`
      : "/advisory?request=site-visit";

  const heading = siteVisit ? "Experience it in person." : "Not sure where to start?";
  const lede = siteVisit
    ? "Choose a day and a time. A TokenZameen advisor confirms the appointment and meets you at the project."
    : DESCRIPTION;

  return (
    <>
      <Section tone="bone" space="none" aria-labelledby="advisory-heading" className="pb-16 pt-10 sm:pb-24 sm:pt-16">
        <Container width="wide">
          <div className={siteVisit ? "max-w-3xl" : "grid gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20"}>
            <Reveal>
              <Eyebrow withRule>{siteVisit ? "Site visit" : "Advisory"}</Eyebrow>
              <h1 id="advisory-heading" className="mt-5 text-balance text-display-xl">
                {heading}
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
                {lede}
              </p>

              {project || intent || unknownProject ? (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {project ? (
                    <Link
                      href={`/purchase/${project.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] py-1.5 pl-3 pr-2 text-sm text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--text-primary)]"
                    >
                      <span className="eyebrow text-[color:var(--text-muted)]">
                        {CATEGORY_LABEL[project.primaryCategory]}
                      </span>
                      {project.name}
                      <ArrowUpRight className="size-3.5 text-[color:var(--accent)]" aria-hidden />
                    </Link>
                  ) : null}
                  {intent ? <Badge tone="gold" size="md">{intent.title}</Badge> : null}
                  {unknownProject ? (
                    <p className="text-xs text-[color:var(--text-muted)]">
                      We could not find that property. Tell us what you were looking at and an advisor will find it.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <ul className="mt-8 space-y-3 text-sm">
                <li>
                  <Link
                    href={switchHref}
                    className="group inline-flex min-h-9 items-center gap-2 text-[color:var(--text-primary)] underline decoration-[color:var(--accent)] decoration-1 underline-offset-[6px] transition-opacity hover:opacity-70"
                  >
                    {siteVisit ? "Prefer to talk first? Send an enquiry instead" : "Already decided? Schedule a site visit"}
                    <ArrowUpRight className="size-4 text-[color:var(--accent)] transition-transform duration-300 ease-[var(--ease-luxe)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
                <li>
                  <a
                    href="#ai"
                    className="group inline-flex min-h-9 items-center gap-2 text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]"
                  >
                    <Sparkles className="size-4 text-[color:var(--accent)]" aria-hidden />
                    Or ask TokenZameen AI first
                  </a>
                </li>
              </ul>
            </Reveal>

            {siteVisit ? null : (
              <Reveal delay={0.1}>
                <div className="rounded-panel border border-[color:var(--hairline)] bg-[color:var(--surface)] p-5 shadow-lift sm:p-8">
                  {project ? (
                    <>
                      <p className="eyebrow text-[color:var(--text-muted)]">Enquire about</p>
                      <h2 className="mt-2 text-display-sm">{project.name}</h2>
                      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                        Tell us how to reach you. A property advisor takes it from there — no payment at this step.
                      </p>
                      <div className="mt-6">
                        <EnquiryForm
                          projectSlug={project.slug}
                          projectName={project.name}
                          categorySlug={project.primaryCategory}
                          source="property-enquiry"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="eyebrow text-[color:var(--text-muted)]">Your requirement</p>
                      <h2 className="mt-2 text-display-sm">Budget, location, type, purpose, timeline.</h2>
                      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                        As much or as little as you have. An advisor works with whatever you can give them.
                      </p>
                      <div className="mt-6">
                        {intent ? (
                          <FormPrefill
                            fields={{
                              purpose: intent.purposes[0] ?? "",
                              categorySlug: intent.categories[0] ?? "",
                            }}
                          >
                            <AdvisoryForm />
                          </FormPrefill>
                        ) : (
                          <AdvisoryForm />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Reveal>
            )}
          </div>

          {siteVisit ? (
            <Reveal delay={0.1} className="mt-12">
              <SiteVisitPlanner
                projectSlug={project?.slug ?? null}
                projectName={project?.name ?? null}
                properties={project ? undefined : properties}
              />
            </Reveal>
          ) : null}
        </Container>
      </Section>

      <AdvisorJourney />

      <AdvisorSection id="ai" tone="paper" />
    </>
  );
}
