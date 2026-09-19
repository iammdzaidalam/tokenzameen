import { CircleCheck } from "lucide-react";
import { PendingPanel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { RequestButton } from "@/components/property/detail/request-context";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function AmenitiesSection({ project, index }: { project: Project; index: string }) {
  return (
    <Section tone="bone" space="md" aria-label={`${project.name} amenities`}>
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <SectionHeading index={index} eyebrow="Amenities" title="What is included" size="md" />

          {project.amenities.length > 0 ? (
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {project.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-start gap-3 border-b border-[color:var(--hairline)] pb-4 text-sm text-[color:var(--text-primary)]"
                >
                  <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-[color:var(--accent)]" />
                  {amenity}
                </li>
              ))}
            </ul>
          ) : (
            <PendingPanel
              title="Amenity schedule on request"
              body="The developer has not released a confirmed amenity schedule for this project. We would rather send you the signed schedule than list facilities that may not survive the final specification."
              action={
                <RequestButton subject="the amenity schedule" variant="solid">
                  Request the amenity schedule
                </RequestButton>
              }
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
