import { CalendarClock, Send } from "lucide-react";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { SiteVisitForm } from "@/components/forms/site-visit-form";
import { Panel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function SiteVisitSection({
  project,
  siteVisitForm,
  enquiryForm,
}: {
  project: Project;
  siteVisitForm?: React.ReactNode;
  enquiryForm?: React.ReactNode;
}) {
  return (
    <Section
      id="site-visit"
      tone="darker"
      aria-label={`Visit or enquire about ${project.name}`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <SectionHeading
          eyebrow="Next step"
          title="Experience it in person."
          lead={`Walk the site with a TokenZameen advisor. You will see ${project.name} as it stands today — not as a rendering — and get straight answers on what is still being confirmed.`}
        />

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
          <Panel className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <CalendarClock aria-hidden className="size-5 text-[color:var(--accent)]" />
              <h3 className="font-subhead text-base font-medium text-[color:var(--text-primary)]">
                Schedule a site visit
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Pick a date and an advisor confirms the appointment with you. Nothing is treated as a
              booking until they have spoken to you.
            </p>
            {siteVisitForm ?? (
              <SiteVisitForm projectSlug={project.slug} projectName={project.name} compact />
            )}
          </Panel>

          <Panel className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Send aria-hidden className="size-5 text-[color:var(--accent)]" />
              <h3
                id="enquire"
                tabIndex={-1}
                className="scroll-mt-[9.5rem] font-subhead text-base font-medium text-[color:var(--text-primary)] focus:outline-none"
              >
                Enquire about {project.name}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Express interest first — nothing is payable at this step. An advisor calls you, walks
              you through the documentation, and only then does anything move forward.
            </p>
            {enquiryForm ?? (
              <EnquiryForm
                projectSlug={project.slug}
                projectName={project.name}
                source="property-enquiry"
                compact
              />
            )}
          </Panel>
        </div>
      </Container>
    </Section>
  );
}
