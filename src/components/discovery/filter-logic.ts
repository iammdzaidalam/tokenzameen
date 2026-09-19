import { BUDGET_CEILING, BUDGET_FLOOR, categories } from "@/lib/catalog";
import {
  EMPTY_FILTERS,
  filterProjects,
  parseSearchQuery,
  type FilterState,
  type ParsedQuery,
} from "@/lib/filters";
import { formatAmount, formatBedrooms } from "@/lib/format";
import {
  AVAILABILITY_LABEL,
  CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
  PURPOSE_LABEL,
  SPECIAL_TAG_LABEL,
} from "@/lib/labels";
import type {
  Availability,
  BedroomConfig,
  CategorySlug,
  Project,
  PropertyType,
  Purpose,
  SpecialTag,
} from "@/types/catalog";

export const CATEGORY_OPTIONS: readonly CategorySlug[] = categories.map((category) => category.slug);

export const TYPE_OPTIONS: readonly PropertyType[] = [
  "apartment",
  "villa",
  "commercial",
  "sustainable-villa",
  "spiritual-residence",
  "plot",
];

export const PURPOSE_OPTIONS: readonly Purpose[] = [
  "self-use",
  "investment",
  "second-home",
  "rental-income",
  "capital-appreciation",
  "commercial-income",
  "land-banking",
];

export const AVAILABILITY_OPTIONS: readonly Availability[] = [
  "available",
  "limited",
  "coming-soon",
  "sold-out",
];

export const TAG_OPTIONS: readonly SpecialTag[] = [
  "pre-leased",
  "high-rental-potential",
  "early-access",
  "premium-location",
  "sustainable",
  "investment-opportunity",
];

export const BEDROOM_OPTIONS: readonly BedroomConfig[] = ["1bhk", "2bhk", "3bhk", "4bhk", "5plus"];

export const BUDGET_STEP = 250_000;

/** parseSearchQuery emits a category alongside every property type it detects. */
const TYPE_CATEGORY: Record<PropertyType, CategorySlug> = {
  apartment: "apartments",
  villa: "villas",
  commercial: "commercial",
  "sustainable-villa": "sustainable-living",
  "spiritual-residence": "spiritual-residences",
  plot: "plots",
};

export interface FilterChip {
  id: string;
  label: string;
  next: FilterState;
}

export interface EmptySuggestion {
  id: string;
  label: string;
  count: number;
  next: FilterState;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function countMatching(
  projects: Project[],
  filters: FilterState,
  patch: Partial<FilterState>,
): number {
  return filterProjects(projects, { ...filters, ...patch }).length;
}

export function budgetLabel(min: number, max: number): string {
  const upper = max >= BUDGET_CEILING ? `${formatAmount(BUDGET_CEILING)}+` : formatAmount(max);
  if (min <= BUDGET_FLOOR) return `Up to ${upper}`;
  return `${formatAmount(min)} – ${upper}`;
}

export function budgetIsDefault(filters: FilterState): boolean {
  return filters.budgetMin <= BUDGET_FLOOR && filters.budgetMax >= BUDGET_CEILING;
}

export function clearedFilters(filters: FilterState): FilterState {
  return { ...EMPTY_FILTERS, sort: filters.sort };
}

export function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

export function activeFilterChips(filters: FilterState): FilterChip[] {
  const chips: FilterChip[] = [];
  const query = filters.q.trim();

  if (query) {
    chips.push({ id: "q", label: `“${query}”`, next: { ...filters, q: "" } });
  }
  for (const slug of filters.categories) {
    chips.push({
      id: `category:${slug}`,
      label: CATEGORY_LABEL[slug],
      next: { ...filters, categories: filters.categories.filter((entry) => entry !== slug) },
    });
  }
  for (const type of filters.types) {
    chips.push({
      id: `type:${type}`,
      label: PROPERTY_TYPE_LABEL[type],
      next: { ...filters, types: filters.types.filter((entry) => entry !== type) },
    });
  }
  for (const city of filters.cities) {
    chips.push({
      id: `city:${city}`,
      label: city,
      next: { ...filters, cities: filters.cities.filter((entry) => entry !== city) },
    });
  }
  for (const bedroom of filters.bedrooms) {
    chips.push({
      id: `bhk:${bedroom}`,
      label: formatBedrooms([bedroom]),
      next: { ...filters, bedrooms: filters.bedrooms.filter((entry) => entry !== bedroom) },
    });
  }
  for (const purpose of filters.purposes) {
    chips.push({
      id: `purpose:${purpose}`,
      label: PURPOSE_LABEL[purpose],
      next: { ...filters, purposes: filters.purposes.filter((entry) => entry !== purpose) },
    });
  }
  for (const availability of filters.availability) {
    chips.push({
      id: `availability:${availability}`,
      label: AVAILABILITY_LABEL[availability],
      next: {
        ...filters,
        availability: filters.availability.filter((entry) => entry !== availability),
      },
    });
  }
  for (const tag of filters.tags) {
    chips.push({
      id: `tag:${tag}`,
      label: SPECIAL_TAG_LABEL[tag],
      next: { ...filters, tags: filters.tags.filter((entry) => entry !== tag) },
    });
  }
  if (!budgetIsDefault(filters)) {
    chips.push({
      id: "budget",
      label: budgetLabel(filters.budgetMin, filters.budgetMax),
      next: { ...filters, budgetMin: BUDGET_FLOOR, budgetMax: BUDGET_CEILING },
    });
  }
  if (filters.publishedPriceOnly) {
    chips.push({
      id: "priced",
      label: "Published price only",
      next: { ...filters, publishedPriceOnly: false },
    });
  }

  return chips;
}

type InterpretationOmit =
  | { kind: "bedroom"; value: BedroomConfig }
  | { kind: "city"; value: string }
  | { kind: "type"; value: PropertyType }
  | { kind: "budget-min" }
  | { kind: "budget-max" }
  | { kind: "text" };

/**
 * Removing one thing the search bar understood must not silently drop the rest,
 * so the surviving interpretation is promoted into explicit filters and the
 * input keeps only the free text.
 */
function promote(
  filters: FilterState,
  parsed: ParsedQuery,
  omit: InterpretationOmit,
): FilterState {
  const keptTypes = (parsed.types ?? []).filter(
    (type) => !(omit.kind === "type" && omit.value === type),
  );
  const keptCategories = (parsed.categories ?? []).filter((category) =>
    keptTypes.some((type) => TYPE_CATEGORY[type] === category),
  );

  return {
    ...filters,
    q: omit.kind === "text" ? "" : parsed.residual,
    categories: unique([...filters.categories, ...keptCategories]),
    types: unique([...filters.types, ...keptTypes]),
    cities: unique([
      ...filters.cities,
      ...(parsed.cities ?? []).filter((city) => !(omit.kind === "city" && omit.value === city)),
    ]),
    bedrooms: unique([
      ...filters.bedrooms,
      ...(parsed.bedrooms ?? []).filter(
        (bedroom) => !(omit.kind === "bedroom" && omit.value === bedroom),
      ),
    ]),
    budgetMin:
      omit.kind === "budget-min"
        ? filters.budgetMin
        : Math.max(filters.budgetMin, parsed.budgetMin ?? BUDGET_FLOOR),
    budgetMax:
      omit.kind === "budget-max"
        ? filters.budgetMax
        : Math.min(filters.budgetMax, parsed.budgetMax ?? BUDGET_CEILING),
  };
}

export function interpretationChips(filters: FilterState, cities: string[]): FilterChip[] {
  if (!filters.q.trim()) return [];
  const parsed = parseSearchQuery(filters.q, cities);
  const chips: FilterChip[] = [];

  for (const bedroom of parsed.bedrooms ?? []) {
    chips.push({
      id: `read-bhk:${bedroom}`,
      label: formatBedrooms([bedroom]),
      next: promote(filters, parsed, { kind: "bedroom", value: bedroom }),
    });
  }
  if (parsed.budgetMax !== undefined) {
    chips.push({
      id: "read-budget-max",
      label: `Under ${formatAmount(parsed.budgetMax)}`,
      next: promote(filters, parsed, { kind: "budget-max" }),
    });
  }
  if (parsed.budgetMin !== undefined) {
    chips.push({
      id: "read-budget-min",
      label: `Above ${formatAmount(parsed.budgetMin)}`,
      next: promote(filters, parsed, { kind: "budget-min" }),
    });
  }
  for (const type of parsed.types ?? []) {
    chips.push({
      id: `read-type:${type}`,
      label: PROPERTY_TYPE_LABEL[type],
      next: promote(filters, parsed, { kind: "type", value: type }),
    });
  }
  for (const city of parsed.cities ?? []) {
    chips.push({
      id: `read-city:${city}`,
      label: city,
      next: promote(filters, parsed, { kind: "city", value: city }),
    });
  }
  if (parsed.residual) {
    chips.push({
      id: "read-text",
      label: `Text “${parsed.residual}”`,
      next: promote(filters, parsed, { kind: "text" }),
    });
  }

  return chips;
}

export function emptyStateSuggestions(
  projects: Project[],
  filters: FilterState,
): EmptySuggestion[] {
  const dimensions: Array<{
    id: string;
    label: string;
    active: boolean;
    patch: Partial<FilterState>;
  }> = [
    { id: "q", label: "the search text", active: filters.q.trim().length > 0, patch: { q: "" } },
    {
      id: "categories",
      label: "the collection filter",
      active: filters.categories.length > 0,
      patch: { categories: [] },
    },
    {
      id: "types",
      label: "the property type filter",
      active: filters.types.length > 0,
      patch: { types: [] },
    },
    {
      id: "cities",
      label: "the location filter",
      active: filters.cities.length > 0,
      patch: { cities: [] },
    },
    {
      id: "bedrooms",
      label: "the bedroom filter",
      active: filters.bedrooms.length > 0,
      patch: { bedrooms: [] },
    },
    {
      id: "purposes",
      label: "the purpose filter",
      active: filters.purposes.length > 0,
      patch: { purposes: [] },
    },
    {
      id: "availability",
      label: "the availability filter",
      active: filters.availability.length > 0,
      patch: { availability: [] },
    },
    {
      id: "tags",
      label: "the special opportunities filter",
      active: filters.tags.length > 0,
      patch: { tags: [] },
    },
    {
      id: "budget",
      label: "the budget range",
      active: !budgetIsDefault(filters),
      patch: { budgetMin: BUDGET_FLOOR, budgetMax: BUDGET_CEILING },
    },
    {
      id: "priced",
      label: "the “published price only” toggle",
      active: filters.publishedPriceOnly,
      patch: { publishedPriceOnly: false },
    },
  ];

  return dimensions
    .filter((dimension) => dimension.active)
    .map((dimension) => ({
      id: dimension.id,
      label: dimension.label,
      count: countMatching(projects, filters, dimension.patch),
      next: { ...filters, ...dimension.patch },
    }))
    .filter((suggestion) => suggestion.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function publishedBedrooms(projects: Project[]): Set<BedroomConfig> {
  const configs = new Set<BedroomConfig>();
  for (const project of projects) {
    for (const bedroom of project.bedrooms) configs.add(bedroom);
  }
  return configs;
}
