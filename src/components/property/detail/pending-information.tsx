import { ClipboardList, Hourglass } from "lucide-react";
import { SectionHeading } from "@/components/property/detail/detail-primitives";
import { RequestButton } from "@/components/property/detail/request-context";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function PendingInformationSection({ project }: { project: Project }) {
  if (project.pendingInformation.length === 0) return null;

  return (
    <Section tone="light" aria-label={`Information being compiled for ${project.name}`}>
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Information being compiled"
              title="What we do not know yet"
              lead={`These are the things a buyer should be able to check about ${project.name} that the project owner has not supplied. We would rather name the gap than fill it with an estimate.`}
            />

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <RequestButton subject="the full information pack" variant="primary" size="lg">
                <ClipboardList aria-hidden className="size-4" />
                Request the full information pack
              </RequestButton>
              <p className="text-xs text-[color:var(--text-muted)]">
                We will tell you what exists today and when the rest is expected.
              </p>
            </div>
          </div>

          <RevealGroup
            as="ul"
            className="flex flex-col divide-y divide-[color:var(--hairline)] border-y border-[color:var(--hairline)]"
          >
            {project.pendingInformation.map((item) => (
              <RevealItem as="li" key={item} className="flex items-center gap-4 py-5">
                <Hourglass aria-hidden className="size-4 shrink-0 text-[color:var(--accent)]" />
                <span className="text-base text-[color:var(--text-primary)]">{item}</span>
                <span className="ml-auto shrink-0 text-xs text-[color:var(--text-muted)]">
                  Awaited
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </Section>
  );
}
