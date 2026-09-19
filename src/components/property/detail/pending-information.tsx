import { ClipboardList } from "lucide-react";
import { SectionHeading } from "@/components/property/detail/detail-primitives";
import { RequestButton } from "@/components/property/detail/request-context";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function PendingInformationSection({ project, index }: { project: Project; index: string }) {
  if (project.pendingInformation.length === 0) return null;

  return (
    <Section tone="paper" aria-label={`Information being compiled for ${project.name}`}>
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
          <div>
            <SectionHeading
              index={index}
              eyebrow="Information being compiled"
              title="What we do not know yet"
              lead={`These are the things a buyer should be able to check about ${project.name} that the project owner has not supplied. We would rather name the gap than fill it with an estimate.`}
            />

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <RequestButton subject="the full information pack" variant="solid" size="lg">
                <ClipboardList aria-hidden className="size-4" />
                Request the full information pack
              </RequestButton>
              <p className="max-w-xs text-xs text-[color:var(--text-muted)]">
                We will tell you what exists today and when the rest is expected.
              </p>
            </div>
          </div>

          <RevealGroup as="ol" className="border-t border-[color:var(--hairline)]">
            {project.pendingInformation.map((item, position) => (
              <RevealItem
                as="li"
                key={item}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-[color:var(--hairline)] py-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:py-6"
              >
                <IndexLabel index={String(position + 1).padStart(2, "0")} dot={false}>
                  Awaited
                </IndexLabel>
                <span className="text-pretty font-display text-lg text-[color:var(--text-primary)] sm:text-xl">
                  {item}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </Section>
  );
}
