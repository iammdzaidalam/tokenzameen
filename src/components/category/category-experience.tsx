import { AdvisoryCta } from "@/components/category/advisory-cta";
import { CategoryAudience } from "@/components/category/category-audience";
import { CategoryHero } from "@/components/category/category-hero";
import { CategoryProjects } from "@/components/category/category-projects";
import { CategoryRail } from "@/components/category/category-rail";
import { LuxofyCollection, findLuxofy } from "@/components/category/luxofy-collection";
import { CommercialThesis } from "@/components/category/blocks/commercial-thesis";
import { FormatStandards } from "@/components/category/blocks/format-standards";
import { PlotDiligence } from "@/components/category/blocks/plot-diligence";
import { SpiritualCollections } from "@/components/category/blocks/spiritual-collections";
import { SustainablePillars } from "@/components/category/blocks/sustainable-pillars";
import type { Category, Project } from "@/types/catalog";

function StorytellingBlock({
  category,
  index,
  featured,
}: {
  category: Category;
  index: string;
  featured: Project | null;
}) {
  switch (category.slug) {
    case "apartments":
      return <FormatStandards variant="apartments" accent={category.accent} index={index} />;
    case "villas":
      return <FormatStandards variant="villas" accent={category.accent} index={index} />;
    case "commercial":
      return <CommercialThesis accent={category.accent} index={index} />;
    case "sustainable-living":
      return <SustainablePillars accent={category.accent} index={index} featured={featured} />;
    case "spiritual-residences":
      return <SpiritualCollections accent={category.accent} index={index} />;
    case "plots":
      return <PlotDiligence accent={category.accent} index={index} />;
  }
}

export function CategoryExperience({
  category,
  projects,
}: {
  category: Category;
  projects: Project[];
}) {
  const quiet = category.slug === "spiritual-residences";
  const isLuxofyCategory = category.slug === "villas" || category.slug === "apartments";

  /** A project shown inside the storytelling block is not repeated in the grid. */
  const featured = isLuxofyCategory
    ? findLuxofy(projects)
    : category.slug === "sustainable-living"
      ? (projects[0] ?? null)
      : null;

  const rest = featured ? projects.filter((project) => project.slug !== featured.slug) : projects;

  let position = 0;
  const next = () => String(++position).padStart(2, "0");

  return (
    <>
      <CategoryHero category={category} projectCount={projects.length} quiet={quiet} />
      <CategoryAudience category={category} index={next()} quiet={quiet} />
      <StorytellingBlock category={category} index={next()} featured={featured} />
      {isLuxofyCategory && featured ? (
        <LuxofyCollection
          projects={projects}
          accent={category.accent}
          index={next()}
          defaultFormat={category.slug === "villas" ? "villas" : "apartments"}
        />
      ) : null}
      <CategoryProjects category={category} index={next()} projects={rest} featured={featured} />
      <CategoryRail category={category} index={next()} />
      <AdvisoryCta
        accent={category.accent}
        quiet={quiet}
        href={quiet ? "/advisory?intent=live-differently" : "/advisory"}
      />
    </>
  );
}
