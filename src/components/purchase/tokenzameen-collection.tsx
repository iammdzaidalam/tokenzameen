import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/catalog";

export function TokenZameenCollection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  const [lead, closer, ...rest] = projects;

  return (
    <Section id="collection" tone="paper" aria-label="The TokenZameen Collection" space="xl">
      <Container width="wide">
        <Reveal>
          <div className="max-w-3xl">
            <IndexLabel index="03">Featured collections</IndexLabel>
            <h2 className="mt-6 text-display-lg uppercase text-[color:var(--text-primary)]">
              The TokenZameen Collection
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
              A selection of properties we&rsquo;re currently bringing to the attention of our
              community.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 space-y-6 lg:mt-16 lg:space-y-10">
          <Reveal>
            <p className="eyebrow mb-4 text-[color:var(--text-muted)]">Featured</p>
            <PropertyCard project={lead} variant="feature" />
          </Reveal>

          {rest.length > 0 ? (
            <RevealGroup
              stagger={0.1}
              className={cn(
                "grid gap-6",
                rest.length > 2 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2",
              )}
            >
              {rest.map((project) => (
                <RevealItem key={project.slug}>
                  <PropertyCard project={project} className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : null}

          {closer ? (
            <Reveal>
              <p className="eyebrow mb-4 text-[color:var(--text-muted)]">Featured</p>
              <PropertyCard project={closer} variant="feature" />
            </Reveal>
          ) : null}
        </div>

        <Reveal>
          <Button href="/purchase/properties" variant="secondary" size="lg" className="mt-10">
            View the full collection
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
