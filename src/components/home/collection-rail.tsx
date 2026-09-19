import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PropertyCard } from "@/components/property/property-card";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { getAllProjects, getFeaturedProjects } from "@/lib/catalog";

const RAIL_SIZE = 4;

export function CollectionRail() {
  const featured = getFeaturedProjects();
  const all = getAllProjects();
  const featuredSlugs = new Set(featured.map((project) => project.slug));
  const projects = [...featured, ...all.filter((project) => !featuredSlugs.has(project.slug))].slice(0, RAIL_SIZE);

  if (projects.length === 0) return null;

  return (
    <Section tone="paper" space="lg" aria-labelledby="rail-heading">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <IndexLabel index="04">Currently in the collection</IndexLabel>
              <h2 id="rail-heading" className="mt-5 max-w-[16ch] text-balance text-display-lg">
                A short list, on purpose.
              </h2>
            </div>
            <Link
              href="/purchase/properties"
              className="group inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--text-primary)] underline decoration-[color:var(--accent)] decoration-1 underline-offset-[6px] transition-opacity duration-300 hover:opacity-70 lg:pb-2"
            >
              View all {all.length} properties
              <ArrowUpRight className="size-4 text-[color:var(--accent)] transition-transform duration-300 ease-[var(--ease-luxe)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </Container>

      <div className="no-scrollbar mt-10 overflow-x-auto snap-x snap-mandatory lg:mt-14">
        <Container width="wide">
          <ul className="flex gap-5 pb-2 lg:gap-6">
            {projects.map((project, index) => (
              <li key={project.slug} className="w-[84vw] shrink-0 snap-start sm:w-[24rem]">
                <PropertyCard project={project} priority={index === 0} className="h-full" />
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </Section>
  );
}
