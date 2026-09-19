import { SectionHeading } from "@/components/property/detail/detail-primitives";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getRelatedProjects } from "@/lib/catalog";
import type { Project } from "@/types/catalog";

export function RelatedSection({ project }: { project: Project }) {
  const related = getRelatedProjects(project);
  if (related.length === 0) return null;

  return (
    <Section tone="dark" space="md" aria-label="Related properties">
      <Container width="wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Also consider" title="Related properties" size="md" />
          <Button href="/purchase/properties" variant="link" size="sm">
            Browse the full collection
          </Button>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <li key={item.slug}>
              <PropertyCard project={item} variant="compact" />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
