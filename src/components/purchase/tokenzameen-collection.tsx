import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { PropertyCard } from "@/components/property/property-card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/catalog";

export function TokenZameenCollection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  const [lead, closer, ...rest] = projects;

  return (
    <Section id="collection" tone="darker" aria-label="The TokenZameen Collection" space="xl">
      <Container width="wide">
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow withRule>Featured collections</Eyebrow>
            <h2 className="mt-6 text-display-lg uppercase">The TokenZameen Collection</h2>
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
          <Link
            href="/purchase/properties"
            className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--accent)] transition-opacity duration-300 hover:opacity-80"
          >
            View the full collection
            <ArrowUpRight className="size-4" />
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
