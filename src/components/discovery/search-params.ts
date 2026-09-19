import { parseFilters, type FilterState } from "@/lib/filters";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export function toSearchParams(input: SearchParamsInput): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const entry of value) params.append(key, entry);
    } else if (typeof value === "string") {
      params.set(key, value);
    }
  }
  return params;
}

export function filtersFromSearchParams(input: SearchParamsInput): FilterState {
  return parseFilters(toSearchParams(input));
}
