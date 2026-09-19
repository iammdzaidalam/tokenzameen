import { BUDGET_CEILING, BUDGET_FLOOR } from "@/lib/catalog";
import { parseBudgetInput } from "@/lib/format";
import type {
  Availability,
  BedroomConfig,
  CategorySlug,
  Project,
  PropertyType,
  Purpose,
  SpecialTag,
} from "@/types/catalog";

export const SORT_KEYS = [
  "recommended",
  "price-asc",
  "price-desc",
  "newest",
  "rental-potential",
  "capital-appreciation",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABEL: Record<SortKey, string> = {
  recommended: "Recommended",
  "price-asc": "Price — Low to High",
  "price-desc": "Price — High to Low",
  newest: "Newest",
  "rental-potential": "Highest Rental Potential",
  "capital-appreciation": "Highest Appreciation Potential",
};

export interface FilterState {
  q: string;
  categories: CategorySlug[];
  types: PropertyType[];
  cities: string[];
  budgetMin: number;
  budgetMax: number;
  bedrooms: BedroomConfig[];
  purposes: Purpose[];
  availability: Availability[];
  tags: SpecialTag[];
  publishedPriceOnly: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: FilterState = {
  q: "",
  categories: [],
  types: [],
  cities: [],
  budgetMin: BUDGET_FLOOR,
  budgetMax: BUDGET_CEILING,
  bedrooms: [],
  purposes: [],
  availability: [],
  tags: [],
  publishedPriceOnly: false,
  sort: "recommended",
};

const CATEGORY_VALUES: CategorySlug[] = [
  "apartments",
  "villas",
  "commercial",
  "sustainable-living",
  "spiritual-residences",
  "plots",
];
const TYPE_VALUES: PropertyType[] = [
  "apartment",
  "villa",
  "commercial",
  "sustainable-villa",
  "spiritual-residence",
  "plot",
];
const BEDROOM_VALUES: BedroomConfig[] = ["1bhk", "2bhk", "3bhk", "4bhk", "5plus"];
const PURPOSE_VALUES: Purpose[] = [
  "self-use",
  "investment",
  "second-home",
  "rental-income",
  "capital-appreciation",
  "commercial-income",
  "land-banking",
];
const AVAILABILITY_VALUES: Availability[] = ["available", "limited", "coming-soon", "sold-out"];
const TAG_VALUES: SpecialTag[] = [
  "pre-leased",
  "high-rental-potential",
  "early-access",
  "premium-location",
  "sustainable",
  "investment-opportunity",
];

function readList<T extends string>(params: URLSearchParams, key: string, allowed: readonly T[]): T[] {
  const raw = params.get(key);
  if (!raw) return [];
  const allowedSet = new Set<string>(allowed);
  return [...new Set(raw.split(",").map((v) => v.trim()).filter((v) => allowedSet.has(v)))] as T[];
}

function readNumber(params: URLSearchParams, key: string, fallback: number): number {
  const raw = params.get(key);
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

export function parseFilters(params: URLSearchParams): FilterState {
  const sortRaw = params.get("sort");
  const sort = (SORT_KEYS as readonly string[]).includes(sortRaw ?? "")
    ? (sortRaw as SortKey)
    : "recommended";

  const budgetMin = Math.max(BUDGET_FLOOR, readNumber(params, "min", BUDGET_FLOOR));
  const budgetMax = Math.min(BUDGET_CEILING, readNumber(params, "max", BUDGET_CEILING));

  return {
    q: params.get("q")?.slice(0, 120) ?? "",
    categories: readList(params, "category", CATEGORY_VALUES),
    types: readList(params, "type", TYPE_VALUES),
    cities: (params.get("city") ?? "").split(",").map((c) => c.trim()).filter(Boolean).slice(0, 12),
    budgetMin: Math.min(budgetMin, budgetMax),
    budgetMax: Math.max(budgetMin, budgetMax),
    bedrooms: readList(params, "bhk", BEDROOM_VALUES),
    purposes: readList(params, "purpose", PURPOSE_VALUES),
    availability: readList(params, "availability", AVAILABILITY_VALUES),
    tags: readList(params, "tag", TAG_VALUES),
    publishedPriceOnly: params.get("priced") === "1",
    sort,
  };
}

export function serializeFilters(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  if (filters.types.length) params.set("type", filters.types.join(","));
  if (filters.cities.length) params.set("city", filters.cities.join(","));
  if (filters.budgetMin > BUDGET_FLOOR) params.set("min", String(filters.budgetMin));
  if (filters.budgetMax < BUDGET_CEILING) params.set("max", String(filters.budgetMax));
  if (filters.bedrooms.length) params.set("bhk", filters.bedrooms.join(","));
  if (filters.purposes.length) params.set("purpose", filters.purposes.join(","));
  if (filters.availability.length) params.set("availability", filters.availability.join(","));
  if (filters.tags.length) params.set("tag", filters.tags.join(","));
  if (filters.publishedPriceOnly) params.set("priced", "1");
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  return params;
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  count += filters.categories.length;
  count += filters.types.length;
  count += filters.cities.length;
  count += filters.bedrooms.length;
  count += filters.purposes.length;
  count += filters.availability.length;
  count += filters.tags.length;
  if (filters.budgetMin > BUDGET_FLOOR || filters.budgetMax < BUDGET_CEILING) count += 1;
  if (filters.publishedPriceOnly) count += 1;
  if (filters.q.trim()) count += 1;
  return count;
}

function matchesText(project: Project, query: string): boolean {
  const haystack = [
    project.name,
    project.positioning,
    project.summary,
    project.location.label,
    ...project.location.cities,
    ...project.usps,
    ...project.categories,
    ...project.propertyTypes,
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .every((token) => haystack.includes(token));
}

export function filterProjects(source: Project[], filters: FilterState): Project[] {
  const structured = parseSearchQuery(filters.q);
  const categories = filters.categories.length ? filters.categories : structured.categories ?? [];
  const types = filters.types.length ? filters.types : structured.types ?? [];
  const bedrooms = filters.bedrooms.length ? filters.bedrooms : structured.bedrooms ?? [];
  const cities = filters.cities.length ? filters.cities : structured.cities ?? [];
  const budgetMax = Math.min(filters.budgetMax, structured.budgetMax ?? BUDGET_CEILING);
  const budgetMin = Math.max(filters.budgetMin, structured.budgetMin ?? BUDGET_FLOOR);
  const residualQuery = structured.residual ?? filters.q;

  return source.filter((project) => {
    if (categories.length && !categories.some((c) => project.categories.includes(c))) return false;
    if (types.length && !types.some((t) => project.propertyTypes.includes(t))) return false;
    if (cities.length) {
      const cityMatch = cities.some((city) =>
        project.location.cities.some((c) => c.toLowerCase() === city.toLowerCase()),
      );
      if (!cityMatch) return false;
    }
    if (bedrooms.length) {
      if (project.bedrooms.length === 0) return false;
      if (!bedrooms.some((b) => project.bedrooms.includes(b))) return false;
    }
    if (filters.purposes.length && !filters.purposes.some((p) => project.purposes.includes(p))) return false;
    if (filters.availability.length && !filters.availability.includes(project.availability)) return false;
    if (filters.tags.length && !filters.tags.some((t) => project.specialTags.includes(t))) return false;

    const price = project.priceFrom?.amount ?? null;
    if (filters.publishedPriceOnly && price === null) return false;
    // An unpublished price cannot be excluded on budget without hiding real inventory.
    // The card shows "Price on request" so the reason is visible.
    if (price !== null && (price < budgetMin || price > budgetMax)) return false;

    if (residualQuery.trim() && !matchesText(project, residualQuery)) return false;
    return true;
  });
}

function intelligenceValue(project: Project, key: "rentalPotential" | "capitalAppreciation"): number {
  return project.intelligence ? project.intelligence[key] : -1;
}

export function sortProjects(source: Project[], sort: SortKey): Project[] {
  const list = [...source];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => {
        const av = a.priceFrom?.amount ?? Number.POSITIVE_INFINITY;
        const bv = b.priceFrom?.amount ?? Number.POSITIVE_INFINITY;
        return av - bv || b.editorialRank - a.editorialRank;
      });
    case "price-desc":
      return list.sort((a, b) => {
        const av = a.priceFrom?.amount ?? Number.NEGATIVE_INFINITY;
        const bv = b.priceFrom?.amount ?? Number.NEGATIVE_INFINITY;
        return bv - av || b.editorialRank - a.editorialRank;
      });
    case "newest":
      return list.sort(
        (a, b) => b.lastUpdated.localeCompare(a.lastUpdated) || b.editorialRank - a.editorialRank,
      );
    case "rental-potential":
      return list.sort(
        (a, b) =>
          intelligenceValue(b, "rentalPotential") - intelligenceValue(a, "rentalPotential") ||
          b.editorialRank - a.editorialRank,
      );
    case "capital-appreciation":
      return list.sort(
        (a, b) =>
          intelligenceValue(b, "capitalAppreciation") - intelligenceValue(a, "capitalAppreciation") ||
          b.editorialRank - a.editorialRank,
      );
    default:
      return list.sort((a, b) => b.editorialRank - a.editorialRank);
  }
}

export interface ParsedQuery {
  categories?: CategorySlug[];
  types?: PropertyType[];
  bedrooms?: BedroomConfig[];
  cities?: string[];
  budgetMin?: number;
  budgetMax?: number;
  residual: string;
}

const TYPE_PATTERNS: Array<[RegExp, PropertyType, CategorySlug]> = [
  [/\b(apartment|apartments|flat|flats|bhk)\b/, "apartment", "apartments"],
  [/\b(villa|villas|bungalow)\b/, "villa", "villas"],
  [/\b(commercial|shop|shops|retail|office|offices)\b/, "commercial", "commercial"],
  [/\b(plot|plots|land|plotted)\b/, "plot", "plots"],
  [/\b(sustainable|eco|green)\b/, "sustainable-villa", "sustainable-living"],
  [/\b(spiritual|pilgrimage|meditation|retreat|wellness)\b/, "spiritual-residence", "spiritual-residences"],
];

const BEDROOM_PATTERN = /\b([1-5])\s*(?:\+)?\s*bhk\b/g;
const BUDGET_PATTERN =
  /\b(under|below|upto|up to|less than|above|over|minimum|min|starting)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lac|lakh|lakhs|k)?\b/g;

/**
 * Turns "3 BHK under ₹2 crore in Delhi" into filter values. Deterministic on
 * purpose — the AI advisor calls this too, so search never depends on a model
 * being reachable.
 */
export function parseSearchQuery(raw: string, knownCities: string[] = []): ParsedQuery {
  const result: ParsedQuery = { residual: "" };
  if (!raw.trim()) return result;

  let text = ` ${raw.toLowerCase()} `;

  const bedrooms = new Set<BedroomConfig>();
  for (const match of text.matchAll(BEDROOM_PATTERN)) {
    const n = Number.parseInt(match[1], 10);
    bedrooms.add(n >= 5 ? "5plus" : (`${n}bhk` as BedroomConfig));
  }
  if (bedrooms.size) {
    result.bedrooms = [...bedrooms];
    text = text.replace(BEDROOM_PATTERN, " ");
  }

  for (const match of text.matchAll(BUDGET_PATTERN)) {
    const amount = parseBudgetInput(`${match[2]}${match[3] ?? ""}`);
    if (amount === null) continue;
    const direction = match[1];
    if (/above|over|minimum|min|starting/.test(direction)) {
      result.budgetMin = amount;
    } else {
      result.budgetMax = amount;
    }
  }
  text = text.replace(BUDGET_PATTERN, " ");

  const types = new Set<PropertyType>();
  const categories = new Set<CategorySlug>();
  for (const [pattern, type, category] of TYPE_PATTERNS) {
    if (pattern.test(text)) {
      types.add(type);
      categories.add(category);
      text = text.replace(pattern, " ");
    }
  }
  if (types.size) result.types = [...types];
  if (categories.size) result.categories = [...categories];

  const cities = new Set<string>();
  for (const city of knownCities) {
    const pattern = new RegExp(`\\b${city.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (pattern.test(text)) {
      cities.add(city);
      text = text.replace(pattern, " ");
    }
  }
  if (cities.size) result.cities = [...cities];

  result.residual = text.replace(/\b(in|near|around|with|for|show|me|find|a|an|the|property|properties)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return result;
}
