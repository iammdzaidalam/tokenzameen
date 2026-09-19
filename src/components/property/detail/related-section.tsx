import { SectionHeading } from "@/components/property/detail/detail-primitives";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";
import { getRelatedProjects } from "@/lib/catalog";
import type { Project } from "@/types/catalog";

export function RelatedSection({ project, index }: { project: Project; index: string }) {
  const related = getRelatedProjects(project);
  if (related.length === 0) return null;

  return (
    <Section tone="bone" space="md" aria-label="Related properties">
      <Container width="wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading index={index} eyebrow="Also consider" title="Related properties" size="md" />
          <Button href="/purchase/properties" variant="link" size="sm">
            Browse the full collection
          </Button>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <li key={item.slug} className="group relative">
              <PropertyCard project={item} variant="compact" className="pr-16" />
              <TileArrow
                size="sm"
                tone="solid"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
