"use client";

import { categories } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { countMatching, type FilterState } from "@/lib/filters";
import type { Project } from "@/types/catalog";

export function CategoryChips({
  filters,
  projects,
  onChange,
  className,
}: {
  filters: FilterState;
  projects: Project[];
  onChange: (next: FilterState) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Property collections"
      className={cn(
        "no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0",
        className,
      )}
    >
      <Chip
        label="All"
        count={countMatching(projects, filters, { categories: [] })}
        active={filters.categories.length === 0}
        onClick={() => onChange({ ...filters, categories: [] })}
      />
      {categories.map((category) => {
        const active = filters.categories.includes(category.slug);
        return (
          <Chip
            key={category.slug}
            label={category.shortName}
            count={countMatching(projects, filters, { categories: [category.slug] })}
            active={active}
            onClick={() => onChange({ ...filters, categories: active ? [] : [category.slug] })}
          />
        );
      })}
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[0.8125rem] transition-colors duration-300",
        active
          ? "border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--surface)]"
          : "border-[color:var(--hairline-strong)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]",
        count === 0 && !active && "opacity-50",
      )}
    >
      {label}
      <span className="tabular text-[0.6875rem] opacity-60">{count}</span>
    </button>
  );
}
