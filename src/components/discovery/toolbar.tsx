"use client";

import { LayoutGrid, Rows3, SlidersHorizontal } from "lucide-react";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { SORT_KEYS, SORT_LABEL, type SortKey } from "@/lib/filters";

export type ResultView = "grid" | "list";

const PILL =
  "inline-flex h-11 items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-4 text-[0.8125rem] text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--text-primary)]";

export function Toolbar({
  resultCount,
  activeCount,
  sort,
  onSortChange,
  view,
  onViewChange,
  onOpenFilters,
  filtersOpen,
}: {
  resultCount: number;
  activeCount: number;
  sort: SortKey;
  onSortChange: (next: SortKey) => void;
  view: ResultView;
  onViewChange: (next: ResultView) => void;
  onOpenFilters: () => void;
  filtersOpen: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="mr-auto text-sm text-[color:var(--text-secondary)]">
        <span className="tabular font-medium text-[color:var(--text-primary)]">{resultCount}</span>
        {resultCount === 1 ? " property" : " properties"}
      </p>

      <button
        type="button"
        onClick={onOpenFilters}
        aria-expanded={filtersOpen}
        aria-label="Filters"
        className={cn(PILL, "px-3.5 sm:px-4 lg:hidden")}
      >
        <SlidersHorizontal className="size-4" />
        <span className="hidden sm:inline">Filters</span>
        {activeCount > 0 ? (
          <span className="tabular grid size-5 place-items-center rounded-full bg-[color:var(--text-primary)] text-[0.625rem] font-semibold text-[color:var(--surface)]">
            {activeCount}
          </span>
        ) : null}
      </button>

      <div className={cn(PILL, "gap-1 pr-1.5")}>
        <span className="eyebrow hidden shrink-0 text-[color:var(--text-muted)] sm:inline">Sort by</span>
        <Select
          value={sort}
          aria-label="Sort results"
          onChange={(event) => onSortChange(event.target.value as SortKey)}
          className="h-9 w-auto max-w-[7.5rem] rounded-full border-transparent bg-transparent py-0 pl-1 pr-8 text-[0.8125rem] focus:border-transparent sm:max-w-none"
        >
          {SORT_KEYS.map((key) => (
            <option key={key} value={key}>
              {SORT_LABEL[key]}
            </option>
          ))}
        </Select>
      </div>

      <div
        role="group"
        aria-label="Result layout"
        className="hidden h-11 shrink-0 items-center gap-1 rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] p-1 sm:inline-flex"
      >
        <ViewButton
          active={view === "grid"}
          label="Grid view"
          onClick={() => onViewChange("grid")}
          icon={<LayoutGrid className="size-4" />}
        />
        <ViewButton
          active={view === "list"}
          label="List view"
          onClick={() => onViewChange("list")}
          icon={<Rows3 className="size-4" />}
        />
      </div>
    </div>
  );
}

function ViewButton({
  active,
  label,
  onClick,
  icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "grid size-8 place-items-center rounded-full transition-colors",
        active
          ? "bg-[color:var(--text-primary)] text-[color:var(--surface)]"
          : "text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]",
      )}
    >
      {icon}
    </button>
  );
}
