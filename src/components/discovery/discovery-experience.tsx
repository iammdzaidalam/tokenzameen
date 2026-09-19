"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Toolbar, type ResultView } from "@/components/discovery/toolbar";
import {
  sameRange,
  sameString,
  useDebouncedMirror,
} from "@/components/discovery/use-debounced-mirror";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Overlay } from "@/components/ui/overlay";
import { Section } from "@/components/ui/section";
import { StatGrid, type Stat } from "@/components/ui/stat-grid";
import { categories } from "@/lib/catalog";
import {
  countActiveFilters,
  filterProjects,
  serializeFilters,
  sortProjects,
  type FilterState,
} from "@/lib/filters";
import { useMediaQuery } from "@/lib/hooks";
import type { Project } from "@/types/catalog";

const ROUTE = "/purchase/properties";
const QUERY_DEBOUNCE = 300;
const BUDGET_DEBOUNCE = 260;

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
  const [view, setView] = useState<ResultView>("grid");
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

  const stats = useMemo<Stat[]>(
    () => [
      { value: projects.length, label: "Projects in the collection" },
      {
        value: categories.length,
        label: "Collections",
        note: "Apartments through Spiritual Residences",
      },
      { value: cities.length, label: "Cities and regions" },
      {
        value: projects.filter((project) => project.priceFrom !== null).length,
        label: "With a published price",
        note: "The rest are shown as price on request.",
      },
    ],
    [projects, cities],
  );

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
    <Section tone="bone" space="none" className="pb-0 pt-14 sm:pt-20">
      <Container width="wide">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:gap-16">
          <div>
            <IndexLabel index="01">The Collection</IndexLabel>
            <h1 className="mt-5 text-balance text-display-xl">Explore Properties</h1>
          </div>
          <p className="text-pretty leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
            Every project TokenZameen has taken on, filtered the way people actually buy — by
            budget, by location, and by what the property is for.
          </p>
        </div>

        <StatGrid stats={stats} invertIndex={1} columns={4} className="mt-12" />

        <SearchBar
          value={draftQuery}
          committedQuery={filters.q}
          onValueChange={setDraftQuery}
          interpretation={readingChips}
          onApply={commit}
          className="mt-12"
        />

        <CategoryChips
          filters={filters}
          projects={projects}
          onChange={commit}
          className="mt-5"
        />
      </Container>

      <div className="sticky top-[72px] z-40 mt-8 border-y border-[color:var(--hairline)] bg-[color:var(--page)]">
        <Container width="wide" className="py-3">
          <Toolbar
            resultCount={results.length}
            activeCount={activeCount}
            sort={filters.sort}
            onSortChange={(sort) => commit({ ...filters, sort })}
            view={view}
            onViewChange={setView}
            onOpenFilters={() => setSheetOpen(true)}
            filtersOpen={sheetOpen}
          />
        </Container>
      </div>

      <Container width="wide" className="mt-8 flex gap-10">
        <aside className="hidden w-[310px] shrink-0 lg:block" aria-label="Filters">
          <div className="sticky top-[150px] max-h-[calc(100vh-11rem)] overflow-y-auto rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-5">
            {rail}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p role="status" aria-live="polite" className="sr-only">
            {results.length === 1 ? "1 property matches" : `${results.length} properties match`} the
            current filters.
          </p>

          {sheetOpen && isTablet ? (
            <div className="mb-8 rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6 lg:hidden">
              {rail}
              <Button variant="solid" full size="sm" className="mt-6" onClick={() => setSheetOpen(false)}>
                Show {results.length === 1 ? "1 property" : `${results.length} properties`}
              </Button>
            </div>
          ) : null}

          <ActiveFilters
            chips={activeChips}
            onApply={commit}
            onClearAll={clearAll}
            className="mb-6"
          />

          {results.length === 0 ? (
            <EmptyState
              suggestions={suggestions}
              activeCount={activeCount}
              onApply={commit}
              onClearAll={clearAll}
            />
          ) : (
            <ResultsGrid projects={results} view={view} />
          )}
        </div>
      </Container>

      <Overlay
        open={sheetOpen && !isTablet}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        placement="bottom"
        tone="light"
      >
        <div className="px-6 py-6">{rail}</div>
        <div className="sticky bottom-0 flex gap-3 border-t border-[color:var(--hairline)] bg-[color:var(--surface)] px-6 py-4">
          <Button variant="secondary" size="sm" onClick={clearAll} disabled={activeCount === 0}>
            Clear all
          </Button>
          <Button variant="solid" size="sm" full onClick={() => setSheetOpen(false)}>
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
