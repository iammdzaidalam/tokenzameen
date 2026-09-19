"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { MAX_COMPARE, useShortlist } from "@/components/providers/shortlist-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Project } from "@/types/catalog";

export function CompareTray({ projects }: { projects: Project[] }) {
  const { ready, compare, removeCompare, clearCompare } = useShortlist();

  const items = ready
    ? compare
        .map((slug) => projects.find((project) => project.slug === slug))
        .filter((project): project is Project => Boolean(project))
    : [];

  if (items.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Comparison tray"
      className="border-t border-[color:var(--hairline)] bg-[color:var(--surface)] shadow-panel"
    >
      <Container width="wide" className="flex items-center gap-4 py-3">
        <ul className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {items.map((project) => (
            <li
              key={project.slug}
              className="flex shrink-0 items-center gap-2 rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface-sunken)] py-1 pl-1 pr-2"
            >
              <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-bone-200">
                <Image
                  src={project.hero.src}
                  alt={project.hero.alt}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </span>
              <span className="hidden max-w-36 truncate text-xs text-[color:var(--text-secondary)] sm:block">
                {project.name}
              </span>
              <button
                type="button"
                onClick={() => removeCompare(project.slug)}
                aria-label={`Remove ${project.name} from the comparison`}
                className="grid size-6 shrink-0 place-items-center rounded-full text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-primary)]"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
          {items.length < MAX_COMPARE ? (
            <li className="hidden shrink-0 pl-2 text-xs text-[color:var(--text-muted)] lg:block">
              Add up to {MAX_COMPARE - items.length} more
            </li>
          ) : null}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clearCompare}
            className="hidden text-xs text-[color:var(--text-muted)] underline-offset-4 transition-colors hover:text-[color:var(--text-primary)] hover:underline sm:block"
          >
            Clear
          </button>
          <Button href="/purchase/compare" variant="solid" size="sm">
            Compare ({items.length})
          </Button>
        </div>
      </Container>
    </div>
  );
}
