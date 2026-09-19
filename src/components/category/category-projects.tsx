import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PropertyCard } from "@/components/property/property-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { CategoryInterest } from "@/components/category/category-interest";
import { SectionHead } from "@/components/category/section-head";
import type { Category, Project } from "@/types/catalog";

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

function countWord(count: number): string {
  return WORDS[count] ?? String(count);
}

export function CategoryProjects({
  category,
  index,
  projects,
  featured = null,
}: {
  category: Category;
  index: string;
  projects: Project[];
  featured?: Project | null;
}) {
  const total = projects.length + (featured ? 1 : 0);

  if (total === 0) {
    return <CategoryInterest category={category} index={index} />;
  }

  const filterHref = `/purchase/properties?category=${category.slug}`;

  const heading = featured
    ? projects.length === 0
      ? {
          title: "One project, for now.",
          lede: `${featured.name} is the only project published in ${category.name} today.`,
        }
      : {
          title: "The rest of the collection.",
          lede: `${countWord(total)} ${total === 1 ? "project is" : "projects are"} published in ${category.name} today, ${featured.name} among them.`,
        }
    : {
        title: "The projects.",
        lede: `${countWord(total)} ${total === 1 ? "project is" : "projects are"} published in ${category.name} today. If it is not listed here, it is not yet on TokenZameen.`,
      };

  return (
    <Section id="collection" tone="bone" space="lg" aria-labelledby="collection-heading">
      <Container width="wide">
        <AccentScope accent={category.accent} tone="light">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHead
              index={index}
              id="collection-heading"
              eyebrow="The collection"
              title={heading.title}
              lede={heading.lede}
              size="md"
            />

            <Reveal mode="fade" delay={0.15} className="lg:pb-2">
              <Link
                href={filterHref}
                className="group inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--text-primary)] underline decoration-[color:var(--accent)] decoration-1 underline-offset-[6px] transition-opacity duration-300 hover:opacity-70"
              >
                Open {category.shortName} in the discovery engine
                <ArrowUpRight className="size-4 text-[color:var(--accent)] transition-transform duration-300 ease-[var(--ease-luxe)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>

          {projects.length === 0 ? (
            <Reveal className="mt-12 rounded-card bg-[color:var(--surface)] p-8 sm:p-10">
              <p className="max-w-2xl text-pretty leading-relaxed text-[color:var(--text-secondary)]">
                More are in review. We would rather publish one project we can stand behind than pad a
                page — when the next one clears, it appears here and in the discovery engine on the
                same day.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                <Link
                  href="/purchase/properties"
                  className="text-sm text-[color:var(--text-primary)] underline decoration-[color:var(--accent)] underline-offset-4 hover:opacity-70"
                >
                  Browse every collection
                </Link>
                <Link
                  href="/advisory"
                  className="text-sm text-[color:var(--text-secondary)] underline underline-offset-4 hover:text-[color:var(--text-primary)]"
                >
                  Tell an advisor what you are looking for
                </Link>
              </div>
            </Reveal>
          ) : projects.length === 1 ? (
            <Reveal className="mt-12">
              <PropertyCard project={projects[0]} variant="feature" />
            </Reveal>
          ) : (
            <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <RevealItem key={project.slug} className="h-full">
                  <PropertyCard project={project} className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </AccentScope>
      </Container>
    </Section>
  );
}
