import { LogoWall, type WallItem } from "@/components/interactions/logo-wall";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { categories, getAllCities, getAllProjects } from "@/lib/catalog";
import { CATEGORY_LABEL } from "@/lib/labels";

/**
 * The logo-wall mechanic, cycling facts from the catalogue: project names,
 * collections and cities. No partner logos exist on file and none are invented.
 */
function wallItems(): WallItem[] {
  const projects = getAllProjects().map<WallItem>((project) => ({
    id: `project-${project.slug}`,
    label: project.name,
    sublabel: CATEGORY_LABEL[project.primaryCategory],
    href: `/purchase/${project.slug}`,
  }));
  const collections = categories.map<WallItem>((category) => ({
    id: `category-${category.slug}`,
    label: category.name,
    sublabel: "Collection",
    href: `/purchase/${category.slug}`,
  }));
  const cities = getAllCities().map<WallItem>((city) => ({
    id: `city-${city}`,
    label: city,
    sublabel: "Market",
    href: `/purchase/properties?city=${encodeURIComponent(city)}`,
  }));
  return [...projects, ...collections, ...cities];
}

export function CollectionWall({ index = "05" }: { index?: string }) {
  const items = wallItems();
  return (
    <Section tone="bone" space="md" aria-label="In the collection">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <IndexLabel index={index}>In the collection</IndexLabel>
            <p className="max-w-sm text-sm text-[color:var(--text-secondary)]">
              Every tile is a project, a collection or a market that is actually on the platform today.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="mt-8">
          <LogoWall items={items} cells={8} />
        </Reveal>
      </Container>
    </Section>
  );
}
