import {
  BedDouble,
  Building,
  Compass,
  FileText,
  Handshake,
  IndianRupee,
  KeyRound,
  Layers,
  MapPin,
  Ruler,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { PendingPanel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { RequestButton } from "@/components/property/detail/request-context";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { HighlightIcon, Project } from "@/types/catalog";

const ICONS: Record<HighlightIcon, React.ComponentType<{ className?: string }>> = {
  type: Building,
  location: MapPin,
  area: Ruler,
  status: BadgeCheck,
  possession: KeyRound,
  price: IndianRupee,
  bedrooms: BedDouble,
  floor: Layers,
  facing: Compass,
  yield: TrendingUp,
  lease: FileText,
  ownership: Handshake,
};

const COLUMNS: Record<number, string> = {
  1: "lg:grid-cols-3",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

export function HighlightsSection({ project }: { project: Project }) {
  const columns = COLUMNS[Math.min(project.highlights.length, 6)] ?? "lg:grid-cols-4";

  return (
    <Section tone="dark" space="md" aria-label={`${project.name} highlights`}>
      <Container width="wide">
        <SectionHeading eyebrow="Snapshot" title="Property highlights" size="md" />

        {project.highlights.length > 0 ? (
          <RevealGroup
            as="ul"
            className={cn("mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-[color:var(--hairline)] bg-[color:var(--hairline)] sm:grid-cols-3", columns)}
          >
            {project.highlights.map((highlight) => {
              const Icon = ICONS[highlight.icon];
              return (
                <RevealItem
                  as="li"
                  key={`${highlight.label}-${highlight.value}`}
                  className="flex flex-col gap-4 bg-[color:var(--surface)] p-5 sm:p-6"
                >
                  <Icon aria-hidden className="size-5 text-[color:var(--accent)]" />
                  <div>
                    <p className="eyebrow text-[color:var(--text-muted)]">{highlight.label}</p>
                    <p className="mt-2 font-subhead text-[0.9375rem] leading-snug text-[color:var(--text-primary)]">
                      {highlight.value}
                    </p>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        ) : (
          <PendingPanel
            className="mt-12"
            title="The highlight sheet is being compiled"
            body="Type, size, floor, possession and price are published here as the project owner confirms each one."
            action={
              <RequestButton subject="the property highlight sheet">Request the details</RequestButton>
            }
          />
        )}
      </Container>
    </Section>
  );
}
