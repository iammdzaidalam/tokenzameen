"use client";

import { X } from "lucide-react";
import type { FilterChip } from "@/components/discovery/filter-logic";
import { cn } from "@/lib/cn";
import type { FilterState } from "@/lib/filters";

export function ActiveFilters({
  chips,
  onApply,
  onClearAll,
  className,
}: {
  chips: FilterChip[];
  onApply: (next: FilterState) => void;
  onClearAll: () => void;
  className?: string;
}) {
  if (chips.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Active filters"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onApply(chip.next)}
          aria-label={`Remove filter ${chip.label}`}
          className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        >
          {chip.label}
          <X className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-xs text-[color:var(--accent)] underline-offset-4 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
