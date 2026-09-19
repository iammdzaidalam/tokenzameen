import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { StatGrid } from "@/components/ui/stat-grid";
import { categories, getAllCities, getAllProjects } from "@/lib/catalog";

const FACET_COUNT = 6;

export function HomeStats() {
  const projects = getAllProjects();
  const cities = getAllCities();
  const confirmed = projects.reduce(
    (sum, project) => sum + Object.values(project.verified).filter(Boolean).length,
    0,
  );

  return (
    <Section tone="bone" space="md" aria-label="The collection in numbers">
      <Container width="wide">
        <Reveal>
          <StatGrid
            invertIndex={1}
            stats={[
              { value: projects.length, label: "Properties in the collection", note: "Every one selected, none syndicated." },
              { value: categories.length, label: "Collections", note: "From apartments to spiritual residences." },
              { value: cities.length, label: "Cities and regions covered", note: cities.join(", ") },
              {
                value: confirmed,
                label: "Verified checks confirmed",
                note: `Of ${projects.length * FACET_COUNT} across the six facets. The rest are in progress, not implied.`,
              },
            ]}
          />
        </Reveal>
      </Container>
    </Section>
  );
}
