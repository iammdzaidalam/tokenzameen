import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Tabs } from "@/components/ui/tabs";
import { PropertyCard } from "@/components/property/property-card";
import { Reveal } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { SectionHead } from "@/components/category/section-head";
import type { Accent } from "@/components/category/accent";
import type { Project } from "@/types/catalog";

const LUXOFY_SLUG = "luxofy";

export function findLuxofy(projects: Project[]): Project | null {
  return projects.find((project) => project.slug === LUXOFY_SLUG) ?? null;
}

const FRAMING = {
  villas: {
    label: "Villas",
    heading: "Taken as a villa",
    body: [
      "A villa at Luxofy is a land-and-privacy decision. Your own boundary, an outdoor room that belongs to nobody else, and a house that can be lived in slowly — which is usually the point of owning in Goa rather than visiting it.",
      "It is also the heavier commitment of the two formats: more to maintain, more to secure, and more to let when you are not there.",
    ],
  },
  apartments: {
    label: "Apartments",
    heading: "Taken as an apartment",
    body: [
      "An apartment at Luxofy is the lighter way to hold the same address. Lock it and leave it, share the cost of the common areas, and arrive to a home that has been looked after in your absence.",
      "It suits a buyer who wants the location and the architecture without taking on the upkeep of a standalone house.",
    ],
  },
} as const;

function Panel({ project, format }: { project: Project; format: "villas" | "apartments" }) {
  const framing = FRAMING[format];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
      <div>
        <h3 className="text-display-sm text-[color:var(--text-primary)]">{framing.heading}</h3>
        <div className="mt-5 space-y-4">
          {framing.body.map((paragraph) => (
            <p
              key={paragraph}
              className="max-w-xl text-pretty text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 rounded-card bg-bone-100 p-6">
          <p className="eyebrow text-[color:var(--text-muted)]">What is not published yet</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
            Luxofy has not released configurations, carpet areas, a payment plan or a price. We do not
            estimate any of them. Ask, and an advisor will send the current position in writing as soon
            as the developer releases it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={`/purchase/${project.slug}`} variant="solid" size="sm">
              View the collection
            </Button>
            <Button href="/advisory" variant="link" size="sm">
              Request details
            </Button>
          </div>
        </div>
      </div>

      <PropertyCard project={project} />
    </div>
  );
}

export function LuxofyCollection({
  projects,
  accent,
  index,
  defaultFormat,
}: {
  projects: Project[];
  accent: Accent;
  index: string;
  defaultFormat: "villas" | "apartments";
}) {
  const project = findLuxofy(projects);
  if (!project) return null;

  const order: Array<"villas" | "apartments"> =
    defaultFormat === "villas" ? ["villas", "apartments"] : ["apartments", "villas"];

  return (
    <Section tone="paper" space="lg" aria-labelledby="luxofy-heading">
      <Container width="wide">
        <AccentScope accent={accent} tone="light">
          <SectionHead
            index={index}
            id="luxofy-heading"
            eyebrow="The Luxofy Collection"
            title="A curated collection of luxury residences."
            lede="Luxofy sits in both of our residential formats, so it is presented as one collection with two ways in. Choose the format you are actually buying — the considerations are not the same."
          />

          <Reveal delay={0.1} className="mt-12">
            <Tabs
              items={order.map((format) => ({
                id: format,
                label: FRAMING[format].label,
                content: <Panel project={project} format={format} />,
              }))}
            />
          </Reveal>
        </AccentScope>
      </Container>
    </Section>
  );
}
