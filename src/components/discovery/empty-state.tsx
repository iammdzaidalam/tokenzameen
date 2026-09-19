"use client";

import { SearchX } from "lucide-react";
import { enquiryHref } from "@/components/discovery/advisory";
import type { EmptySuggestion } from "@/components/discovery/filter-logic";
import { Button } from "@/components/ui/button";
import type { FilterState } from "@/lib/filters";

function plural(count: number): string {
  return count === 1 ? "1 property" : `${count} properties`;
}

export function EmptyState({
  suggestions,
  activeCount,
  onApply,
  onClearAll,
}: {
  suggestions: EmptySuggestion[];
  activeCount: number;
  onApply: (next: FilterState) => void;
  onClearAll: () => void;
}) {
  const [primary, ...rest] = suggestions;

  return (
    <div className="rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8 sm:p-12">
      <span className="grid size-11 place-items-center rounded-full bg-[color:var(--surface-sunken)] text-[color:var(--text-primary)]">
        <SearchX className="size-5" />
      </span>
      <h2 className="mt-6 text-display-sm">No property matches this combination.</h2>

      {primary ? (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
          {primary.label.charAt(0).toUpperCase() + primary.label.slice(1)} is what is excluding
          everything. Drop it and {plural(primary.count)} come back.
        </p>
      ) : activeCount > 0 ? (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
          No single filter is responsible — this combination has nothing in common across the
          collection. Clear it and start again, or hand the brief to an advisor.
        </p>
      ) : (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
          Every filter is already cleared, so there is nothing left to relax. An advisor can tell you
          what is coming to the collection next.
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        {primary ? (
          <Button variant="solid" size="sm" onClick={() => onApply(primary.next)}>
            Remove {primary.label}
          </Button>
        ) : null}
        {rest.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="secondary"
            size="sm"
            onClick={() => onApply(suggestion.next)}
          >
            Remove {suggestion.label} ({suggestion.count})
          </Button>
        ))}
        {activeCount > 0 ? (
          <Button variant={primary ? "ghost" : "solid"} size="sm" onClick={onClearAll}>
            Clear every filter
          </Button>
        ) : null}
      </div>

      <div className="mt-8 border-t border-[color:var(--hairline)] pt-6">
        <p className="text-sm text-[color:var(--text-secondary)]">
          Or describe what you are looking for and a TokenZameen advisor will come back with what
          fits — including projects still being prepared for the collection.
        </p>
        <Button href={enquiryHref()} variant="secondary" size="sm" className="mt-4">
          Speak to an advisor
        </Button>
      </div>
    </div>
  );
}
