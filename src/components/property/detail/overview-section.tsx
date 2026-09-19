import { SectionHeading } from "@/components/property/detail/detail-primitives";
import { TrustPanel } from "@/components/property/detail/trust-panel";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function OverviewSection({ project }: { project: Project }) {
  return (
    <Section
      id="overview"
      tone="light"
      aria-label={`About ${project.name}`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Overview" title={`About ${project.name}`} lead={project.summary} />

            <Reveal className="mt-10 flex flex-col gap-5">
              {project.overview.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-2xl text-base leading-[1.75] text-[color:var(--text-secondary)]"
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            {project.usps.length > 0 ? (
              <div className="mt-10">
                <p className="eyebrow text-[color:var(--text-muted)]">In brief</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.usps.map((usp) => (
                    <li
                      key={usp}
                      className="rounded-full border border-[color:var(--hairline-strong)] px-3.5 py-1.5 text-xs text-[color:var(--text-secondary)]"
                    >
                      {usp}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {project.whyThisProject.length > 0 ? (
              <div className="mt-14 border-t border-[color:var(--hairline)] pt-12">
                <h3 className="text-display-md">Why this project</h3>
                <RevealGroup as="ol" className="mt-8 flex flex-col gap-8">
                  {project.whyThisProject.map((reason, index) => (
                    <RevealItem
                      as="li"
                      key={reason}
                      className="flex gap-5 sm:gap-8"
                    >
                      <span
                        aria-hidden
                        className="tabular shrink-0 font-display text-2xl leading-none text-[color:var(--accent)]"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="max-w-xl text-base leading-[1.7] text-[color:var(--text-secondary)]">
                        {reason}
                      </p>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-[10rem] lg:self-start">
            <TrustPanel project={project} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
