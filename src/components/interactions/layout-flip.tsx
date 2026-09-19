"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * FLIP layout transition: when the wrapper's classes change (grid to list, two
 * columns to three), every child animates from its previous box to its new one.
 * Children must carry a stable `layoutId` through <FlipItem>.
 */
export function FlipGroup({
  id,
  children,
  className,
  as: Tag = "div",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
}) {
  const reduced = useReducedMotion();
  const Component = motion[Tag];
  return (
    <LayoutGroup id={id}>
      <Component layout={!reduced} className={className} transition={{ duration: 0.6, ease: EASE }}>
        {children}
      </Component>
    </LayoutGroup>
  );
}

export function FlipItem({
  layoutId,
  children,
  className,
  index = 0,
  as: Tag = "div",
}: {
  layoutId: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const Component = motion[Tag];
  return (
    <Component
      layout={reduced ? false : "position"}
      layoutId={layoutId}
      className={cn("will-change-transform", className)}
      transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : Math.min(index, 12) * 0.02 }}
    >
      <motion.div layout={!reduced} className="h-full" transition={{ duration: 0.6, ease: EASE }}>
        {children}
      </motion.div>
    </Component>
  );
}
