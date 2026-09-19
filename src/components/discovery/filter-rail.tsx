"use client";

import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CheckPill } from "@/components/discovery/check-pill";
import { BUDGET_STEP, clearedFilters, toggleValue } from "@/components/discovery/filter-logic";
import { Checkbox, TextInput } from "@/components/ui/field";
import { IndexLabel } from "@/components/ui/index-label";
import { RangeSlider } from "@/components/ui/range-slider";
import { BUDGET_CEILING, BUDGET_FLOOR } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import {
  AVAILABILITY_VALUES,
  BEDROOM_VALUES,
  PURPOSE_VALUES,
  TAG_VALUES,
  TYPE_VALUES,
  countActiveFilters,
  countMatching,
  type FilterState,
} from "@/lib/filters";
import { formatAmount, formatBedrooms } from "@/lib/format";
import {
  AVAILABILITY_LABEL,
  PROPERTY_TYPE_LABEL,
  PURPOSE_LABEL,
  SPECIAL_TAG_LABEL,
} from "@/lib/labels";
import type { BedroomConfig, Project } from "@/types/catalog";

function FilterGroup({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[color:var(--hairline)] py-6 first:border-t-0 first:pt-0">
      <IndexLabel index={index}>{title}</IndexLabel>
      {note ? (
        <p className="mt-2.5 text-xs leading-relaxed text-[color:var(--text-muted)]">{note}</p>
      ) : null}
      <div role="group" aria-label={title} className="mt-4">
        {children}
      </div>
    </div>
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
          className="rounded-full bg-[color:var(--surface-sunken)] py-2.5 pl-10 text-[0.8125rem]"
        />
      </div>
      <div className="max-h-52 overflow-y-auto pr-1">
        {visible.length === 0 ? (
          <p className="py-2 text-xs text-[color:var(--text-muted)]">
            No location matches “{term.trim()}”.
          </p>
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

      <FilterGroup index="01" title="Location">
        <LocationPicker cities={cities} filters={filters} projects={projects} onChange={onChange} />
      </FilterGroup>

      <FilterGroup index="02" title="Budget">
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
        <div className="mt-5 rounded-xl bg-[color:var(--surface-sunken)] p-3.5">
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

      <FilterGroup index="03" title="Property Type">
        <div className="flex flex-wrap gap-2">
          {TYPE_VALUES.map((type) => (
            <CheckPill
              key={type}
              label={PROPERTY_TYPE_LABEL[type]}
              count={countMatching(projects, filters, { types: [type] })}
              checked={filters.types.includes(type)}
              onChange={() => onChange({ ...filters, types: toggleValue(filters.types, type) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup index="04" title="Purpose">
        <div className="flex flex-wrap gap-2">
          {PURPOSE_VALUES.map((purpose) => (
            <CheckPill
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
        index="05"
        title="Bedrooms"
        note={
          bedroomsUnavailable
            ? "No project in this view has published a BHK breakdown yet, so these would return nothing. Ask an advisor for unit configurations."
            : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          {BEDROOM_VALUES.map((bedroom) => {
            const selected = filters.bedrooms.includes(bedroom);
            return (
              <CheckPill
                key={bedroom}
                label={formatBedrooms([bedroom])}
                checked={selected}
                disabled={!availableBedrooms.has(bedroom) && !selected}
                title={
                  availableBedrooms.has(bedroom)
                    ? undefined
                    : "Not published for any project in this view"
                }
                onChange={() =>
                  onChange({ ...filters, bedrooms: toggleValue(filters.bedrooms, bedroom) })
                }
              />
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup index="06" title="Availability">
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_VALUES.map((availability) => (
            <CheckPill
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

      <FilterGroup index="07" title="Special Opportunities">
        <div className="flex flex-wrap gap-2">
          {TAG_VALUES.map((tag) => (
            <CheckPill
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
