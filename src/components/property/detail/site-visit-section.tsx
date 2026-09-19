import { CalendarClock, Send } from "lucide-react";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { SiteVisitForm } from "@/components/forms/site-visit-form";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function SiteVisitSection({
  project,
  index,
  siteVisitForm,
  enquiryForm,
}: {
  project: Project;
  index: string;
  siteVisitForm?: React.ReactNode;
  enquiryForm?: React.ReactNode;
}) {
  return (
    <Section
      id="site-visit"
      tone="darker"
      space="xl"
      aria-label={`Visit or enquire about ${project.name}`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <IndexLabel index={index}>Next step</IndexLabel>
              <h2 className="mt-6 max-w-[14ch] text-display-xl text-[color:var(--text-primary)]">
                Experience it in person.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--text-secondary)] lg:pb-3 lg:text-right">
              Walk the site with a TokenZameen advisor. You will see {project.name} as it stands
              today — not as a rendering — and get straight answers on what is still being
              confirmed.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid items-start gap-6 lg:mt-20 lg:grid-cols-2">
          <div
            data-surface="light"
            className="rounded-panel bg-[color:var(--surface)] p-6 text-[color:var(--text-primary)] shadow-lift sm:p-8"
          >
            <div className="flex items-center gap-3">
              <CalendarClock aria-hidden className="size-5 text-[color:var(--accent)]" />
              <h3 className="font-subhead text-base font-medium">Schedule a site visit</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Pick a date and an advisor confirms the appointment with you. Nothing is treated as a
              booking until they have spoken to you.
            </p>
            <div className="mt-6">
              {siteVisitForm ?? (
                <SiteVisitForm projectSlug={project.slug} projectName={project.name} compact />
              )}
            </div>
          </div>

          <div
            data-surface="light"
            className="rounded-panel bg-[color:var(--surface)] p-6 text-[color:var(--text-primary)] shadow-lift sm:p-8"
          >
            <div className="flex items-center gap-3">
              <Send aria-hidden className="size-5 text-[color:var(--accent)]" />
              <h3
                id="enquire"
                tabIndex={-1}
                className="scroll-mt-[9.5rem] font-subhead text-base font-medium focus:outline-none"
              >
                Enquire about {project.name}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Express interest first — nothing is payable at this step. An advisor calls you, walks
              you through the documentation, and only then does anything move forward.
            </p>
            <div className="mt-6">
              {enquiryForm ?? (
                <EnquiryForm
                  projectSlug={project.slug}
                  projectName={project.name}
                  source="property-enquiry"
                  compact
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
