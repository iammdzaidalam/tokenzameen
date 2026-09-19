import { CircleCheck } from "lucide-react";
import { PendingPanel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { RequestButton } from "@/components/property/detail/request-context";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function AmenitiesSection({ project }: { project: Project }) {
  return (
    <Section tone="darker" space="md" aria-label={`${project.name} amenities`}>
      <Container width="wide">
        <SectionHeading eyebrow="Amenities" title="What is included" size="md" />

        {project.amenities.length > 0 ? (
          <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
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
            className="mt-10 max-w-3xl"
            title="Amenity schedule on request"
            body="The developer has not released a confirmed amenity schedule for this project. We would rather send you the signed schedule than list facilities that may not survive the final specification."
            action={
              <RequestButton subject="the amenity schedule" variant="primary">
                Request the amenity schedule
              </RequestButton>
            }
          />
        )}
      </Container>
    </Section>
  );
}
