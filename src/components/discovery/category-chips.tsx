"use client";

import { CATEGORY_OPTIONS, countMatching } from "@/components/discovery/filter-logic";
import { cn } from "@/lib/cn";
import type { FilterState } from "@/lib/filters";
import { CATEGORY_LABEL } from "@/lib/labels";
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
  const allActive = filters.categories.length === 0;

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
        active={allActive}
        onClick={() => onChange({ ...filters, categories: [] })}
      />
      {CATEGORY_OPTIONS.map((slug) => {
        const active = filters.categories.includes(slug);
        return (
          <Chip
            key={slug}
            label={CATEGORY_LABEL[slug]}
            count={countMatching(projects, filters, { categories: [slug] })}
            active={active}
            onClick={() => onChange({ ...filters, categories: active ? [] : [slug] })}
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
          ? "border-[color:var(--accent)] bg-[color:var(--surface-raised)] text-[color:var(--accent)]"
          : "border-[color:var(--hairline-strong)] text-[color:var(--text-secondary)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
        count === 0 && !active && "opacity-45",
      )}
    >
      {label}
      <span className="tabular text-[0.6875rem] text-[color:var(--text-muted)]">{count}</span>
    </button>
  );
}
