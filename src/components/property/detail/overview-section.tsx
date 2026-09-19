import { SectionHeading } from "@/components/property/detail/detail-primitives";
import { TrustPanel } from "@/components/property/detail/trust-panel";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function OverviewSection({ project, index }: { project: Project; index: string }) {
  return (
    <Section
      id="overview"
      tone="bone"
      aria-label={`About ${project.name}`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <SectionHeading
              index={index}
              eyebrow="Overview"
              title={`About ${project.name}`}
              lead={project.summary}
            />

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
                      className="rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface)] px-3.5 py-1.5 text-xs text-[color:var(--text-primary)]"
                    >
                      {usp}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {project.whyThisProject.length > 0 ? (
              <div className="mt-14">
                <h3 className="text-display-md text-[color:var(--text-primary)]">Why this project</h3>
                <RevealGroup as="ol" className="mt-8 border-t border-[color:var(--hairline)]">
                  {project.whyThisProject.map((reason, position) => (
                    <RevealItem
                      as="li"
                      key={reason}
                      className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-[color:var(--hairline)] py-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:py-6"
                    >
                      <IndexLabel index={String(position + 1).padStart(2, "0")} dot={false}>
                        Reason
                      </IndexLabel>
                      <p className="max-w-xl text-pretty font-display text-lg text-[color:var(--text-primary)] sm:text-xl">
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
