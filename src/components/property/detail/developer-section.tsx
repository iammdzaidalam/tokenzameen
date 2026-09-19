import { Building } from "lucide-react";
import { Panel, PendingPanel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { RequestButton } from "@/components/property/detail/request-context";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function DeveloperSection({ project }: { project: Project }) {
  const developer = project.developer;

  return (
    <Section tone="darker" space="md" aria-label={`Developer of ${project.name}`}>
      <Container width="wide">
        <SectionHeading eyebrow="Developer" title="Who is building it" size="md" />

        {developer ? (
          <Panel className="mt-10 flex max-w-3xl flex-col gap-6">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="grid size-12 shrink-0 place-items-center rounded-full border border-[color:var(--hairline-strong)] text-[color:var(--accent)]"
              >
                <Building className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-display-sm text-[color:var(--text-primary)]">
                  {developer.name}
                </h3>
                {developer.established ? (
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                    Established {developer.established}
                  </p>
                ) : null}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
              {developer.about ??
                "A developer profile — track record, delivered projects and construction status — is part of the information pack an advisor sends on request."}
            </p>

            {developer.about === null ? (
              <RequestButton subject={`the developer profile for ${developer.name}`} className="self-start">
                Request the developer profile
              </RequestButton>
            ) : null}
          </Panel>
        ) : (
          <PendingPanel
            className="mt-10 max-w-3xl"
            title="Developer details on request"
            body="The developing entity for this project has not been published here. An advisor will confirm who is building it, and what they have delivered before, in writing."
            action={
              <RequestButton subject="the developer details" variant="primary">
                Request developer details
              </RequestButton>
            }
          />
        )}
      </Container>
    </Section>
  );
}
