import Link from "next/link";
import { getAllProjects } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { EMPTY_FILTERS, countMatching, serializeFilters, type FilterState } from "@/lib/filters";

const PRESETS: Array<{ label: string; patch: Partial<FilterState> }> = [
  { label: "Commercial in Delhi", patch: { categories: ["commercial"], cities: ["Delhi"] } },
  { label: "Plots in Goa", patch: { categories: ["plots"], cities: ["Goa"] } },
  { label: "Sustainable villas", patch: { categories: ["sustainable-living"] } },
  { label: "Second homes", patch: { purposes: ["second-home"] } },
  { label: "Apartments in Haridwar", patch: { categories: ["apartments"], cities: ["Haridwar"] } },
];

export function PopularSearches({
  className,
  labelClassName,
}: {
  className?: string;
  labelClassName?: string;
}) {
  const projects = getAllProjects();
  const chips = PRESETS.map((preset) => ({
    label: preset.label,
    count: countMatching(projects, EMPTY_FILTERS, preset.patch),
    href: `/purchase/properties?${serializeFilters({ ...EMPTY_FILTERS, ...preset.patch }).toString()}`,
  })).filter((chip) => chip.count > 0);

  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <span className={cn("eyebrow text-[color:var(--text-muted)]", labelClassName)}>
        Popular searches :
      </span>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[color:var(--hairline)] bg-white px-4 py-2 text-[0.8125rem] text-carbon-900 shadow-[0_1px_2px_rgb(10_10_12/0.08)] transition-colors duration-300 hover:bg-bone-100"
        >
          {chip.label}
          <span className="tabular text-[0.6875rem] text-carbon-500">{chip.count}</span>
        </Link>
      ))}
    </div>
  );
}
