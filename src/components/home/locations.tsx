import { InteractiveGlobe, type GlobePin } from "@/components/interactions/interactive-globe";
import { LocationsField, type LocationPin } from "@/components/home/locations-field";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { getAllProjects } from "@/lib/catalog";
import { cityPointsFor } from "@/lib/geo";
import { formatPriceFrom } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/labels";
import type { Project } from "@/types/catalog";

/**
 * Compositional positions on a 100×100 field. They are not coordinates: the
 * band is an index of where the collection sits, and says so on the page.
 */
const POSITIONS: Record<string, { x: number; y: number }> = {
  Delhi: { x: 58, y: 22 },
  Gurgaon: { x: 50, y: 33 },
  Haridwar: { x: 71, y: 30 },
  "Goa–Maharashtra Border": { x: 34, y: 54 },
  Goa: { x: 26, y: 68 },
  Bangalore: { x: 52, y: 82 },
};

function pinKeys(project: Project): string[] {
  if (project.location.region?.toLowerCase().includes("border")) return [project.location.label];
  return project.location.cities;
}

export function buildPins(projects: Project[]): LocationPin[] {
  const groups = new Map<string, Project[]>();
  for (const project of projects) {
    for (const key of pinKeys(project)) {
      const list = groups.get(key) ?? [];
      list.push(project);
      groups.set(key, list);
    }
  }

  let fallback = 0;
  return [...groups.entries()].map(([label, members], index) => {
    const position = POSITIONS[label] ?? { x: 20 + ((fallback++ * 23) % 60), y: 40 + ((index * 17) % 40) };
    return {
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label,
      x: position.x,
      y: position.y,
      projects: members.map((project) => ({
        slug: project.slug,
        name: project.name,
        category: CATEGORY_LABEL[project.primaryCategory],
        location: project.location.label,
        price: formatPriceFrom(project.priceFrom),
        image: project.hero.src,
        alt: project.hero.alt,
      })),
    };
  });
}

function buildGlobePins(projects: Project[]): GlobePin[] {
  const pins = buildPins(projects);
  return pins.flatMap((pin) => {
    const sample = projects.find((project) => pin.projects.some((p) => p.slug === project.slug));
    if (!sample) return [];
    const point = cityPointsFor(sample.location.cities, sample.location.region).find(
      (candidate) => candidate.label === pin.label,
    ) ?? cityPointsFor(sample.location.cities, sample.location.region)[0];
    if (!point) return [];
    return [{ ...pin, region: point.region, lng: point.lng, lat: point.lat }];
  });
}

export function Locations() {
  const projects = getAllProjects();
  const pins = buildPins(projects);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const globePins = mapboxToken ? buildGlobePins(projects) : [];

  return (
    <Section tone="darker" space="xl" aria-labelledby="locations-heading" className="overflow-hidden">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <IndexLabel index="03">Where we are looking</IndexLabel>
              <h2 id="locations-heading" className="mt-5 max-w-[16ch] text-balance text-display-lg">
                Where TokenZameen is looking.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--text-secondary)] lg:pb-2 lg:text-right">
              {pins.length} locations, chosen one project at a time.{" "}
              {globePins.length
                ? "Pins mark the city; exact sites are shared by your advisor."
                : "Not a map and not to scale — an index of where the collection currently sits."}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 lg:mt-16">
          {globePins.length ? (
            <InteractiveGlobe pins={globePins} token={mapboxToken} />
          ) : (
            <LocationsField pins={pins} />
          )}
        </Reveal>
      </Container>
    </Section>
  );
}
