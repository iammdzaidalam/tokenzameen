"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { ActiveFilters } from "@/components/discovery/active-filters";
import { CategoryChips } from "@/components/discovery/category-chips";
import { CompareTray } from "@/components/discovery/compare-tray";
import { EmptyState } from "@/components/discovery/empty-state";
import {
  activeFilterChips,
  clearedFilters,
  emptyStateSuggestions,
  interpretationChips,
  publishedBedrooms,
  type EmptySuggestion,
} from "@/components/discovery/filter-logic";
import { FilterRail } from "@/components/discovery/filter-rail";
import { MobileCtaBar } from "@/components/discovery/mobile-cta-bar";
import { ResultsGrid } from "@/components/discovery/results-grid";
import { SearchBar } from "@/components/discovery/search-bar";
import {
  sameRange,
  sameString,
  useDebouncedMirror,
} from "@/components/discovery/use-debounced-mirror";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Select } from "@/components/ui/field";
import { Overlay } from "@/components/ui/overlay";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import {
  SORT_KEYS,
  SORT_LABEL,
  countActiveFilters,
  filterProjects,
  serializeFilters,
  sortProjects,
  type FilterState,
  type SortKey,
} from "@/lib/filters";
import { useMediaQuery } from "@/lib/hooks";
import type { Project } from "@/types/catalog";

const ROUTE = "/purchase/properties";
const QUERY_DEBOUNCE = 300;
const BUDGET_DEBOUNCE = 260;

function SortSelect({
  value,
  onChange,
  className,
}: {
  value: SortKey;
  onChange: (next: SortKey) => void;
  className?: string;
}) {
  return (
    <Select
      value={value}
      aria-label="Sort results"
      onChange={(event) => onChange(event.target.value as SortKey)}
      className={cn(
        "h-10 w-auto min-w-0 max-w-[11.5rem] py-0 text-[0.8125rem] sm:min-w-44 sm:max-w-none",
        className,
      )}
    >
      {SORT_KEYS.map((key) => (
        <option key={key} value={key}>
          {SORT_LABEL[key]}
        </option>
      ))}
    </Select>
  );
}

export function DiscoveryExperience({
  projects,
  cities,
  initialFilters,
}: {
  projects: Project[];
  cities: string[];
  initialFilters: FilterState;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isTablet = useMediaQuery("(min-width: 768px)");

  const urlKey = useMemo(() => serializeFilters(initialFilters).toString(), [initialFilters]);
  const syncedRef = useRef(urlKey);

  useEffect(() => {
    if (urlKey === syncedRef.current) return;
    syncedRef.current = urlKey;
    setFilters(initialFilters);
  }, [urlKey, initialFilters]);

  const commit = useCallback(
    (next: FilterState) => {
      setFilters(next);
      const query = serializeFilters(next).toString();
      syncedRef.current = query;
      startTransition(() => {
        router.replace(query ? `${ROUTE}?${query}` : ROUTE, { scroll: false });
      });
    },
    [router],
  );

  const commitQuery = useCallback((next: string) => commit({ ...filters, q: next }), [commit, filters]);
  const [draftQuery, setDraftQuery] = useDebouncedMirror(
    filters.q,
    commitQuery,
    QUERY_DEBOUNCE,
    sameString,
  );

  const budgetValue = useMemo<[number, number]>(
    () => [filters.budgetMin, filters.budgetMax],
    [filters.budgetMin, filters.budgetMax],
  );
  const commitBudget = useCallback(
    (next: [number, number]) => commit({ ...filters, budgetMin: next[0], budgetMax: next[1] }),
    [commit, filters],
  );
  const [draftBudget, setDraftBudget] = useDebouncedMirror(
    budgetValue,
    commitBudget,
    BUDGET_DEBOUNCE,
    sameRange,
  );

  const results = useMemo(
    () => sortProjects(filterProjects(projects, filters), filters.sort),
    [projects, filters],
  );
  const availableBedrooms = useMemo(
    () => publishedBedrooms(filterProjects(projects, { ...filters, bedrooms: [] })),
    [projects, filters],
  );
  const activeChips = useMemo(() => activeFilterChips(filters), [filters]);
  const readingChips = useMemo(() => interpretationChips(filters, cities), [filters, cities]);
  const suggestions = useMemo<EmptySuggestion[]>(() => {
    if (results.length > 0) return [];
    const fromSearch = readingChips
      .map((chip) => ({
        id: chip.id,
        label: `${chip.label} from the search`,
        count: filterProjects(projects, chip.next).length,
        next: chip.next,
      }))
      .filter((suggestion) => suggestion.count > 0)
      .sort((a, b) => b.count - a.count);
    const seen = new Set(fromSearch.map((suggestion) => serializeFilters(suggestion.next).toString()));
    const fromFilters = emptyStateSuggestions(projects, filters).filter(
      (suggestion) => !seen.has(serializeFilters(suggestion.next).toString()),
    );
    // The narrow fix leads: naming the one phrase that emptied the page beats
    // offering to drop the whole search.
    return [...fromSearch, ...fromFilters];
  }, [results.length, readingChips, projects, filters]);

  const activeCount = countActiveFilters(filters);
  const clearAll = useCallback(() => commit(clearedFilters(filters)), [commit, filters]);

  const rail = (
    <FilterRail
      filters={filters}
      projects={projects}
      cities={cities}
      budgetDraft={draftBudget}
      onBudgetDraft={setDraftBudget}
      onChange={commit}
      availableBedrooms={availableBedrooms}
    />
  );

  return (
    <Section tone="darker" space="none" className="pb-0 pt-28">
      <Container width="wide">
        <Eyebrow withRule>The Collection</Eyebrow>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-display-lg">Explore Properties</h1>
          <p className="text-sm text-[color:var(--text-secondary)]">
            <span className="tabular text-[color:var(--text-primary)]">{results.length}</span> of{" "}
            <span className="tabular">{projects.length}</span> projects shown
          </p>
        </div>

        <SearchBar
          value={draftQuery}
          committedQuery={filters.q}
          onValueChange={setDraftQuery}
          interpretation={readingChips}
          onApply={commit}
          className="mt-8 max-w-3xl"
        />

        <CategoryChips
          filters={filters}
          projects={projects}
          onChange={commit}
          className="mt-6"
        />
      </Container>

      <div className="sticky top-[72px] z-40 mt-6 border-y border-[color:var(--hairline)] bg-[color:var(--surface-raised)] lg:hidden">
        <Container width="wide" className="flex items-center justify-between gap-3 py-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 ? (
              <span className="tabular ml-1 grid size-5 place-items-center rounded-full bg-[color:var(--accent)] text-[0.625rem] font-semibold text-[color:var(--accent-contrast)]">
                {activeCount}
              </span>
            ) : null}
          </Button>
          <SortSelect value={filters.sort} onChange={(sort) => commit({ ...filters, sort })} />
        </Container>
      </div>

      <Container width="wide" className="mt-8 flex gap-10">
        <aside className="hidden w-[300px] shrink-0 lg:block" aria-label="Filters">
          <div className="sticky top-[96px] max-h-[calc(100vh-8rem)] overflow-y-auto pb-6 pr-3">
            {rail}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p role="status" aria-live="polite" className="sr-only">
            {results.length === 1 ? "1 property matches" : `${results.length} properties match`} the
            current filters.
          </p>

          {sheetOpen && isTablet ? (
            <div className="mb-8 rounded-panel border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] p-6 lg:hidden">
              {rail}
              <Button full size="sm" className="mt-6" onClick={() => setSheetOpen(false)}>
                Show {results.length === 1 ? "1 property" : `${results.length} properties`}
              </Button>
            </div>
          ) : null}

          <div className="hidden items-center justify-between gap-6 lg:flex">
            <ActiveFilters chips={activeChips} onApply={commit} onClearAll={clearAll} />
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <span className="text-xs text-[color:var(--text-muted)]">Sort</span>
              <SortSelect value={filters.sort} onChange={(sort) => commit({ ...filters, sort })} />
            </div>
          </div>

          <ActiveFilters
            chips={activeChips}
            onApply={commit}
            onClearAll={clearAll}
            className="lg:hidden"
          />

          <div className={cn(activeChips.length > 0 ? "mt-6" : "mt-0", "lg:mt-6")}>
            {results.length === 0 ? (
              <EmptyState
                suggestions={suggestions}
                activeCount={activeCount}
                onApply={commit}
                onClearAll={clearAll}
              />
            ) : (
              <ResultsGrid projects={results} />
            )}
          </div>
        </div>
      </Container>

      <Overlay
        open={sheetOpen && !isTablet}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        placement="bottom"
      >
        {/* Overlay portals to document.body, outside any Section, so the sheet has to
            declare the panel's own surface for the semantic variables to resolve. */}
        <div data-surface="dark" className="px-6 py-6">
          {rail}
        </div>
        <div
          data-surface="dark"
          className="sticky bottom-0 flex gap-3 border-t border-[color:var(--hairline)] bg-carbon-850 px-6 py-4"
        >
          <Button variant="secondary" size="sm" onClick={clearAll} disabled={activeCount === 0}>
            Clear all
          </Button>
          <Button size="sm" full onClick={() => setSheetOpen(false)}>
            Show {results.length === 1 ? "1 property" : `${results.length} properties`}
          </Button>
        </div>
      </Overlay>

      <div className="sticky bottom-0 z-[90] mt-16">
        <CompareTray projects={projects} />
        <MobileCtaBar />
      </div>
    </Section>
  );
}
