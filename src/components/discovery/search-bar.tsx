"use client";

import { Search, X } from "lucide-react";
import type { FilterChip } from "@/components/discovery/filter-logic";
import { cn } from "@/lib/cn";
import type { FilterState } from "@/lib/filters";

export function SearchBar({
  value,
  committedQuery,
  onValueChange,
  interpretation,
  onApply,
  className,
}: {
  value: string;
  committedQuery: string;
  onValueChange: (next: string) => void;
  interpretation: FilterChip[];
  onApply: (next: FilterState) => void;
  className?: string;
}) {
  const unread = committedQuery.trim().length > 0 && interpretation.length === 0;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-5 top-1/2 size-[18px] -translate-y-1/2 text-[color:var(--text-muted)]"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="Search by location, project or property type"
          aria-label="Search by location, project or property type"
          className="h-14 w-full rounded-full border border-[color:var(--hairline-strong)] bg-white/[0.03] pl-14 pr-14 text-[0.9375rem] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] transition-colors focus:border-[color:var(--accent)] focus:bg-white/[0.06] focus:outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label="Clear the search"
            className="absolute right-4 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-primary)]"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </form>

      {interpretation.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow text-[color:var(--text-muted)]">Reading this as</span>
          {interpretation.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onApply(chip.next)}
              aria-label={`Remove ${chip.label} from the search`}
              className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--surface-raised)] px-3 py-1.5 text-xs text-[color:var(--accent)] transition-opacity hover:opacity-80"
            >
              {chip.label}
              <X className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      ) : null}

      {unread ? (
        <p className="text-xs text-[color:var(--text-muted)]">
          Nothing specific read from this search, so it is not narrowing the results.
        </p>
      ) : null}
    </div>
  );
}
