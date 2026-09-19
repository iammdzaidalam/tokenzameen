"use client";

import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Checkbox, TextInput } from "@/components/ui/field";
import { RangeSlider } from "@/components/ui/range-slider";
import {
  AVAILABILITY_OPTIONS,
  BEDROOM_OPTIONS,
  BUDGET_STEP,
  PURPOSE_OPTIONS,
  TAG_OPTIONS,
  TYPE_OPTIONS,
  clearedFilters,
  countMatching,
  toggleValue,
} from "@/components/discovery/filter-logic";
import { BUDGET_CEILING, BUDGET_FLOOR } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { countActiveFilters, type FilterState } from "@/lib/filters";
import { formatAmount, formatBedrooms } from "@/lib/format";
import {
  AVAILABILITY_LABEL,
  PROPERTY_TYPE_LABEL,
  PURPOSE_LABEL,
  SPECIAL_TAG_LABEL,
} from "@/lib/labels";
import type { BedroomConfig, Project } from "@/types/catalog";

function FilterGroup({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[color:var(--hairline)] py-6 first:border-t-0 first:pt-0">
      <h3 className="eyebrow text-[color:var(--text-muted)]">{title}</h3>
      {note ? <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-muted)]">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function LocationPicker({
  cities,
  filters,
  projects,
  onChange,
}: {
  cities: string[];
  filters: FilterState;
  projects: Project[];
  onChange: (next: FilterState) => void;
}) {
  const [term, setTerm] = useState("");
  const inputId = useId();
  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return cities;
    return cities.filter((city) => city.toLowerCase().includes(needle));
  }, [cities, term]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]"
        />
        <TextInput
          id={inputId}
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Find a location"
          aria-label="Filter the list of locations"
          className="py-2.5 pl-10 text-[0.8125rem]"
        />
      </div>
      <div className="max-h-52 overflow-y-auto pr-1">
        {visible.length === 0 ? (
          <p className="py-2 text-xs text-[color:var(--text-muted)]">No location matches “{term.trim()}”.</p>
        ) : (
          visible.map((city) => (
            <Checkbox
              key={city}
              label={city}
              count={countMatching(projects, filters, { cities: [city] })}
              checked={filters.cities.includes(city)}
              onChange={() => onChange({ ...filters, cities: toggleValue(filters.cities, city) })}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function FilterRail({
  filters,
  projects,
  cities,
  budgetDraft,
  onBudgetDraft,
  onChange,
  availableBedrooms,
  className,
}: {
  filters: FilterState;
  projects: Project[];
  cities: string[];
  budgetDraft: [number, number];
  onBudgetDraft: (next: [number, number]) => void;
  onChange: (next: FilterState) => void;
  availableBedrooms: Set<BedroomConfig>;
  className?: string;
}) {
  const activeCount = countActiveFilters(filters);
  const bedroomsUnavailable = availableBedrooms.size === 0;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-4 pb-5">
        <h2 className="font-display text-lg text-[color:var(--text-primary)]">Refine</h2>
        <button
          type="button"
          onClick={() => onChange(clearedFilters(filters))}
          disabled={activeCount === 0}
          className="text-xs text-[color:var(--accent)] underline-offset-4 transition-opacity hover:underline disabled:pointer-events-none disabled:opacity-40"
        >
          Clear all
        </button>
      </div>

      <FilterGroup title="Location">
        <LocationPicker
          cities={cities}
          filters={filters}
          projects={projects}
          onChange={onChange}
        />
      </FilterGroup>

      <FilterGroup title="Budget">
        <RangeSlider
          min={BUDGET_FLOOR}
          max={BUDGET_CEILING}
          step={BUDGET_STEP}
          value={budgetDraft}
          onChange={onBudgetDraft}
          formatValue={formatAmount}
          minLabel="Minimum budget"
          maxLabel="Maximum budget"
        />
        <div className="mt-5 rounded-xl border border-[color:var(--hairline)] p-3.5">
          <Checkbox
            label="Published price only"
            checked={filters.publishedPriceOnly}
            onChange={() =>
              onChange({ ...filters, publishedPriceOnly: !filters.publishedPriceOnly })
            }
          />
          <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-muted)]">
            Most projects have not published a price yet. With this off they stay in the results as
            “Price on request” instead of being hidden by the budget range.
          </p>
        </div>
      </FilterGroup>

      <FilterGroup title="Property Type">
        <div className="flex flex-col">
          {TYPE_OPTIONS.map((type) => (
            <Checkbox
              key={type}
              label={PROPERTY_TYPE_LABEL[type]}
              count={countMatching(projects, filters, { types: [type] })}
              checked={filters.types.includes(type)}
              onChange={() => onChange({ ...filters, types: toggleValue(filters.types, type) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Purpose">
        <div className="flex flex-col">
          {PURPOSE_OPTIONS.map((purpose) => (
            <Checkbox
              key={purpose}
              label={PURPOSE_LABEL[purpose]}
              count={countMatching(projects, filters, { purposes: [purpose] })}
              checked={filters.purposes.includes(purpose)}
              onChange={() =>
                onChange({ ...filters, purposes: toggleValue(filters.purposes, purpose) })
              }
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        title="Bedrooms"
        note={
          bedroomsUnavailable
            ? "No project in this view has published a BHK breakdown yet, so these would return nothing. Ask an advisor for unit configurations."
            : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((bedroom) => {
            const selected = filters.bedrooms.includes(bedroom);
            const disabled = !availableBedrooms.has(bedroom) && !selected;
            return (
              <button
                key={bedroom}
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                title={disabled ? "Not published for any project in this view" : undefined}
                onClick={() =>
                  onChange({ ...filters, bedrooms: toggleValue(filters.bedrooms, bedroom) })
                }
                className={cn(
                  "rounded-full border px-3.5 py-2 text-xs transition-colors duration-300",
                  selected
                    ? "border-[color:var(--accent)] bg-[color:var(--surface-raised)] text-[color:var(--accent)]"
                    : "border-[color:var(--hairline-strong)] text-[color:var(--text-secondary)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
                  disabled &&
                    "cursor-not-allowed border-[color:var(--hairline)] text-[color:var(--text-muted)] line-through opacity-60 hover:border-[color:var(--hairline)] hover:text-[color:var(--text-muted)]",
                )}
              >
                {formatBedrooms([bedroom])}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="flex flex-col">
          {AVAILABILITY_OPTIONS.map((availability) => (
            <Checkbox
              key={availability}
              label={AVAILABILITY_LABEL[availability]}
              count={countMatching(projects, filters, { availability: [availability] })}
              checked={filters.availability.includes(availability)}
              onChange={() =>
                onChange({
                  ...filters,
                  availability: toggleValue(filters.availability, availability),
                })
              }
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Special Opportunities">
        <div className="flex flex-col">
          {TAG_OPTIONS.map((tag) => (
            <Checkbox
              key={tag}
              label={SPECIAL_TAG_LABEL[tag]}
              count={countMatching(projects, filters, { tags: [tag] })}
              checked={filters.tags.includes(tag)}
              onChange={() => onChange({ ...filters, tags: toggleValue(filters.tags, tag) })}
            />
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}
