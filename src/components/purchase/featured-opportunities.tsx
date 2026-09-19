import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { PropertyCard } from "@/components/property/property-card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function FeaturedOpportunities({
  projects,
  total,
}: {
  projects: Project[];
  total: number;
}) {
  if (projects.length === 0) return null;

  return (
    <Section id="opportunities" aria-label="Featured opportunities" space="xl">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow withRule>Featured Opportunities</Eyebrow>
              <h2 className="mt-6 text-display-lg">Projects currently available.</h2>
            </div>
            <p className="text-sm text-[color:var(--text-secondary)] sm:pb-3 sm:text-right">
              <CountUp to={total} className="tabular text-[color:var(--text-primary)]" /> projects
              across the six collections.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <ul className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-16 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:px-0">
            {projects.map((project) => (
              <li
                key={project.slug}
                className="w-[78vw] max-w-[21rem] shrink-0 snap-start lg:w-auto lg:max-w-none"
              >
                <PropertyCard project={project} className="h-full" />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <Link
            href="/purchase/properties"
            className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--accent)] transition-opacity duration-300 hover:opacity-80"
          >
            View all properties
            <ArrowUpRight className="size-4" />
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
