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
    <div
      className={cn(
        "rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-3 shadow-lift sm:p-4",
        className,
      )}
    >
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative">
        <label htmlFor="discovery-search" className="eyebrow block px-2 text-[color:var(--text-muted)]">
          Search the collection
        </label>
        <div className="relative mt-2">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[color:var(--text-muted)]"
          />
          <input
            id="discovery-search"
            type="search"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder="Search by location, project or property type"
            className="h-12 w-full rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface-sunken)] pl-12 pr-12 text-[0.9375rem] text-[color:var(--text-primary)] transition-colors placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--text-primary)] focus:outline-none"
          />
          {value ? (
            <button
              type="button"
              onClick={() => onValueChange("")}
              aria-label="Clear the search"
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-sunken)] hover:text-[color:var(--text-primary)]"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </form>

      {interpretation.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 px-2 pb-1">
          <span className="eyebrow text-[color:var(--text-muted)]">Reading this as</span>
          {interpretation.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onApply(chip.next)}
              aria-label={`Remove ${chip.label} from the search`}
              className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-3 py-1.5 text-xs text-[color:var(--surface)] transition-opacity hover:opacity-80"
            >
              {chip.label}
              <X className="size-3 opacity-70 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      ) : null}

      {unread ? (
        <p className="mt-3 px-2 pb-1 text-xs text-[color:var(--text-muted)]">
          Nothing specific read from this search, so it is not narrowing the results.
        </p>
      ) : null}
    </div>
  );
}
