import { Building } from "lucide-react";
import { Panel, PendingPanel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { RequestButton } from "@/components/property/detail/request-context";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function DeveloperSection({ project, index }: { project: Project; index: string }) {
  const developer = project.developer;

  return (
    <Section tone="bone" space="md" aria-label={`Developer of ${project.name}`}>
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <SectionHeading index={index} eyebrow="Developer" title="Who is building it" size="md" />

          {developer ? (
            <Panel className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-[color:var(--page)] text-[color:var(--accent)]"
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

              <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
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
              title="Developer details on request"
              body="The developing entity for this project has not been published here. An advisor will confirm who is building it, and what they have delivered before, in writing."
              action={
                <RequestButton subject="the developer details" variant="solid">
                  Request developer details
                </RequestButton>
              }
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
