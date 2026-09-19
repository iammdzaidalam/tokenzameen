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
  featured,
}: {
  category: Category;
  featured: Project | null;
}) {
  switch (category.slug) {
    case "apartments":
      return <FormatStandards variant="apartments" accent={category.accent} />;
    case "villas":
      return <FormatStandards variant="villas" accent={category.accent} />;
    case "commercial":
      return <CommercialThesis accent={category.accent} />;
    case "sustainable-living":
      return <SustainablePillars accent={category.accent} featured={featured} />;
    case "spiritual-residences":
      return <SpiritualCollections accent={category.accent} />;
    case "plots":
      return <PlotDiligence accent={category.accent} />;
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

  return (
    <>
      <CategoryHero category={category} projectCount={projects.length} quiet={quiet} />
      <CategoryAudience category={category} quiet={quiet} />
      <StorytellingBlock category={category} featured={featured} />
      {isLuxofyCategory ? (
        <LuxofyCollection
          projects={projects}
          accent={category.accent}
          defaultFormat={category.slug === "villas" ? "villas" : "apartments"}
        />
      ) : null}
      <CategoryProjects category={category} projects={rest} featured={featured} />
      <CategoryRail category={category} tone={quiet ? "darker" : "dark"} />
      <AdvisoryCta
        accent={category.accent}
        quiet={quiet}
        href={quiet ? "/advisory?intent=live-differently" : "/advisory"}
      />
    </>
  );
}
