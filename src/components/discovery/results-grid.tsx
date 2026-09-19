"use client";

import { FlipGroup, FlipItem } from "@/components/interactions/layout-flip";
import { PropertyRow } from "@/components/discovery/property-row";
import type { ResultView } from "@/components/discovery/toolbar";
import { PropertyCard } from "@/components/property/property-card";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/catalog";

export function ResultsGrid({
  projects,
  view,
  className,
}: {
  projects: Project[];
  view: ResultView;
  className?: string;
}) {
  return (
    <FlipGroup
      id="discovery-results"
      className={cn(
        view === "grid"
          ? "grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3"
          : "flex flex-col gap-4",
        className,
      )}
    >
      {projects.map((project, index) => (
        <FlipItem key={project.slug} layoutId={`result-${project.slug}`} index={index} className="flex">
          {view === "grid" ? (
            <PropertyCard project={project} priority={index < 2} className="w-full" />
          ) : (
            <PropertyRow project={project} priority={index < 2} className="w-full" />
          )}
        </FlipItem>
      ))}
    </FlipGroup>
  );
}
