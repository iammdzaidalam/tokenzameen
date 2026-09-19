"use client";

import { motion, useReducedMotion } from "motion/react";
import { PropertyCard } from "@/components/property/property-card";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/catalog";

export function ResultsGrid({
  projects,
  className,
}: {
  projects: Project[];
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3", className)}
    >
      {projects.map((project, index) => (
        <motion.div
          key={project.slug}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0 : 0.32,
            delay: reduced ? 0 : Math.min(index, 5) * 0.035,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex"
        >
          <PropertyCard project={project} priority={index < 2} className="w-full" />
        </motion.div>
      ))}
    </div>
  );
}
