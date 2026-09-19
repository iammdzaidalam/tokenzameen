"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { BUDGET_CEILING, BUDGET_FLOOR } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { CATEGORY_VALUES, EMPTY_FILTERS, serializeFilters, type FilterState } from "@/lib/filters";
import { formatAmount } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/labels";
import type { CategorySlug, Purpose } from "@/types/catalog";

const RESULTS_ROUTE = "/purchase/properties";

const TABS: Array<{ id: string; label: string; purpose: Purpose | null }> = [
  { id: "all", label: "All", purpose: null },
  { id: "buy", label: "Buy a Home", purpose: "self-use" },
  { id: "second-home", label: "Second Home", purpose: "second-home" },
  { id: "invest", label: "Invest", purpose: "investment" },
];

const BUDGET_BANDS: Array<{ id: string; label: string; min: number; max: number }> = [
  { id: "any", label: "Any budget", min: BUDGET_FLOOR, max: BUDGET_CEILING },
  { id: "under-50l", label: `Under ${formatAmount(5_000_000)}`, min: BUDGET_FLOOR, max: 5_000_000 },
  {
    id: "50l-1cr",
    label: `${formatAmount(5_000_000)} – ${formatAmount(10_000_000)}`,
    min: 5_000_000,
    max: 10_000_000,
  },
  {
    id: "1cr-3cr",
    label: `${formatAmount(10_000_000)} – ${formatAmount(30_000_000)}`,
    min: 10_000_000,
    max: 30_000_000,
  },
  {
    id: "3cr-plus",
    label: `${formatAmount(30_000_000)} and above`,
    min: 30_000_000,
    max: BUDGET_CEILING,
  },
];

function SearchField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5 md:px-5 md:first:pl-0", className)}>
      <label htmlFor={htmlFor} className="eyebrow text-[color:var(--text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}

const FIELD_CONTROL =
  "h-10 rounded-none border-0 bg-transparent px-0 py-0 pr-8 text-[0.9375rem] text-[color:var(--text-primary)]";

export function SearchCard({ cities, className }: { cities: string[]; className?: string }) {
  const router = useRouter();
  const fieldId = useId();
  const [tab, setTab] = useState(TABS[0].id);
  const [category, setCategory] = useState<CategorySlug | "">("");
  const [city, setCity] = useState("");
  const [band, setBand] = useState(BUDGET_BANDS[0].id);

  const submit = () => {
    const purpose = TABS.find((entry) => entry.id === tab)?.purpose;
    const budget = BUDGET_BANDS.find((entry) => entry.id === band) ?? BUDGET_BANDS[0];
    const filters: FilterState = {
      ...EMPTY_FILTERS,
      categories: category ? [category] : [],
      cities: city ? [city] : [],
      budgetMin: budget.min,
      budgetMax: budget.max,
      purposes: purpose ? [purpose] : [],
    };
    const query = serializeFilters(filters).toString();
    router.push(query ? `${RESULTS_ROUTE}?${query}` : RESULTS_ROUTE);
  };

  return (
    <div className={cn("rounded-card bg-white p-4 shadow-lift sm:p-5", className)}>
      <div
        role="group"
        aria-label="What are you buying for"
        className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full bg-bone-100 p-1 sm:inline-flex"
      >
        {TABS.map((entry) => {
          const active = entry.id === tab;
          return (
            <button
              key={entry.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(entry.id)}
              className={cn(
                "min-h-11 shrink-0 whitespace-nowrap rounded-full px-3 text-[0.8125rem] font-medium transition-color sm:px-4s duration-300",
                active
                  ? "bg-white text-carbon-900 shadow-[0_1px_2px_rgb(10_10_12/0.12)]"
                  : "text-carbon-500 hover:text-carbon-900",
              )}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        role="search"
        aria-label="Search the TokenZameen collection"
        className="mt-4 flex flex-col gap-4 sm:mt-5 md:flex-row md:items-end md:gap-0"
      >
        <SearchField label="Property Type" htmlFor={`${fieldId}-category`}>
          <Select
            id={`${fieldId}-category`}
            value={category}
            onChange={(event) =>
              setCategory(CATEGORY_VALUES.find((slug) => slug === event.target.value) ?? "")
            }
            className={FIELD_CONTROL}
          >
            <option value="">All collections</option>
            {CATEGORY_VALUES.map((slug) => (
              <option key={slug} value={slug}>
                {CATEGORY_LABEL[slug]}
              </option>
            ))}
          </Select>
        </SearchField>

        <SearchField
          label="Location"
          htmlFor={`${fieldId}-city`}
          className="md:border-l md:border-[color:var(--hairline)]"
        >
          <Select
            id={`${fieldId}-city`}
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={FIELD_CONTROL}
          >
            <option value="">Anywhere</option>
            {cities.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </Select>
        </SearchField>

        <SearchField
          label="Budget"
          htmlFor={`${fieldId}-budget`}
          className="md:border-l md:border-[color:var(--hairline)]"
        >
          <Select
            id={`${fieldId}-budget`}
            value={band}
            onChange={(event) => setBand(event.target.value)}
            className={FIELD_CONTROL}
          >
            {BUDGET_BANDS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </Select>
        </SearchField>

        <Button type="submit" variant="solid" size="lg" className="w-full md:ml-5 md:w-auto">
          <Search className="size-4" aria-hidden />
          Search
        </Button>
      </form>
    </div>
  );
}
