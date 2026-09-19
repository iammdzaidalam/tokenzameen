"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { enquiryHref, siteVisitHref } from "@/components/discovery/advisory";
import { MAX_COMPARE, useShortlist } from "@/components/providers/shortlist-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { DISCLAIMERS } from "@/content/config";
import { cn } from "@/lib/cn";
import { formatArea, formatBedrooms, formatDate, formatMoney } from "@/lib/format";
import {
  AVAILABILITY_LABEL,
  CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
  SPECIAL_TAG_LABEL,
} from "@/lib/labels";
import type { Project } from "@/types/catalog";

const ON_REQUEST = "On request";
const AWAITING = "Awaiting assessment";

interface CompareRow {
  id: string;
  label: string;
  value: (project: Project) => string;
}

const ROWS: CompareRow[] = [
  { id: "price", label: "Price", value: (p) => formatMoney(p.priceFrom, ON_REQUEST) },
  { id: "area", label: "Area", value: (p) => formatArea(p.area, ON_REQUEST) },
  { id: "location", label: "Location", value: (p) => p.location.label },
  {
    id: "category",
    label: "Category",
    value: (p) => p.categories.map((slug) => CATEGORY_LABEL[slug]).join(", "),
  },
  {
    id: "type",
    label: "Property Type",
    value: (p) => p.propertyTypes.map((type) => PROPERTY_TYPE_LABEL[type]).join(", "),
  },
  { id: "bedrooms", label: "Bedrooms", value: (p) => formatBedrooms(p.bedrooms, ON_REQUEST) },
  { id: "availability", label: "Availability", value: (p) => AVAILABILITY_LABEL[p.availability] },
  {
    id: "tags",
    label: "Special tags",
    value: (p) =>
      p.specialTags.length
        ? p.specialTags.map((tag) => SPECIAL_TAG_LABEL[tag]).join(", ")
        : "None listed",
  },
  { id: "possession", label: "Possession", value: (p) => p.possession ?? ON_REQUEST },
  { id: "developer", label: "Developer", value: (p) => p.developer?.name ?? ON_REQUEST },
  { id: "rera", label: "RERA", value: (p) => p.reraNumber ?? ON_REQUEST },
  {
    id: "rental",
    label: "Rental potential",
    value: (p) => (p.intelligence ? `${p.intelligence.rentalPotential}/10` : AWAITING),
  },
  {
    id: "appreciation",
    label: "Capital appreciation",
    value: (p) => (p.intelligence ? `${p.intelligence.capitalAppreciation}/10` : AWAITING),
  },
  {
    id: "amenities",
    label: "Amenities",
    value: (p) => (p.amenities.length ? p.amenities.join(", ") : ON_REQUEST),
  },
  { id: "updated", label: "Last updated", value: (p) => formatDate(p.lastUpdated) },
];

const STICKY_CELL =
  "sticky left-0 w-[9.5rem] min-w-[9.5rem] text-left align-top sm:w-52 sm:min-w-52";

export function CompareExperience({ projects }: { projects: Project[] }) {
  const { ready, compare, removeCompare, clearCompare } = useShortlist();

  const selected = ready
    ? compare
        .map((slug) => projects.find((project) => project.slug === slug))
        .filter((project): project is Project => Boolean(project))
    : [];

  return (
    <Section tone="bone" space="none" className="pb-24 pt-14 sm:pt-20">
      <Container width="wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <IndexLabel index="01">Side by side</IndexLabel>
            <h1 className="mt-5 text-balance text-display-lg">Compare Properties</h1>
          </div>
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={clearCompare}
              className="text-sm text-[color:var(--accent)] underline-offset-4 hover:underline"
            >
              Clear comparison
            </button>
          ) : null}
        </div>

        {!ready ? (
          <p className="mt-10 text-sm text-[color:var(--text-secondary)]">
            Loading your comparison…
          </p>
        ) : selected.length === 0 ? (
          <div className="mt-10 rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8 sm:p-12">
            <h2 className="text-display-sm">Nothing to compare yet.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Add up to {MAX_COMPARE} properties from the collection and this table will put their
              price, area, location, availability and documentation next to each other.
            </p>
            <Button href="/purchase/properties" variant="solid" size="sm" className="mt-6">
              Browse the collection
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-5 text-sm text-[color:var(--text-secondary)]">
              {selected.length === 1
                ? "One property selected — add another to see what separates them."
                : "Rows where the properties differ are highlighted."}
            </p>

            <div className="mt-8 max-h-[calc(100dvh-9rem)] overflow-auto rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)]">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">
                  Comparison of {selected.length} selected properties
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={cn(
                        STICKY_CELL,
                        "top-0 z-40 border-r border-white/10 bg-carbon-900 px-4 py-4",
                      )}
                    >
                      <span className="eyebrow text-steel-400">Parameter</span>
                    </th>
                    {selected.map((project) => (
                      <th
                        key={project.slug}
                        scope="col"
                        className="sticky top-0 z-30 min-w-56 bg-carbon-900 px-4 py-4 text-left align-top"
                      >
                        <span className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-carbon-800">
                          <Image
                            src={project.hero.src}
                            alt={project.hero.alt}
                            fill
                            sizes="224px"
                            className="object-cover"
                          />
                        </span>
                        <Link
                          href={`/purchase/${project.slug}`}
                          className="mt-3 block font-display text-base font-medium text-bone-100 hover:text-gold-300"
                        >
                          {project.name}
                        </Link>
                        <span className="mt-1 block text-xs font-normal text-steel-300">
                          {project.location.label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => {
                    const values = selected.map((project) => row.value(project));
                    const differs = selected.length > 1 && new Set(values).size > 1;
                    return (
                      <tr key={row.id} className="border-b border-[color:var(--hairline)]">
                        <th
                          scope="row"
                          className={cn(
                            STICKY_CELL,
                            "z-20 border-r border-[color:var(--hairline)] bg-[color:var(--surface)] px-4 py-4 text-xs font-medium text-[color:var(--text-secondary)]",
                          )}
                        >
                          {row.label}
                          {differs ? (
                            <span className="mt-1 block text-[0.625rem] uppercase tracking-[0.18em] text-[color:var(--accent)]">
                              Differs
                            </span>
                          ) : null}
                        </th>
                        {values.map((value, index) => (
                          <td
                            key={selected[index].slug}
                            className={cn(
                              "min-w-56 px-4 py-4 align-top text-[color:var(--text-primary)]",
                              differs && "bg-[color:var(--surface-sunken)]",
                              (value === ON_REQUEST || value === AWAITING) &&
                                "text-[color:var(--text-muted)]",
                            )}
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr>
                    <th
                      scope="row"
                      className={cn(
                        STICKY_CELL,
                        "z-20 border-r border-[color:var(--hairline)] bg-[color:var(--surface)] px-4 py-4 text-xs font-medium text-[color:var(--text-secondary)]",
                      )}
                    >
                      Next step
                    </th>
                    {selected.map((project) => (
                      <td key={project.slug} className="min-w-56 px-4 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <Button href={enquiryHref(project.slug)} variant="solid" size="sm">
                            Request Details
                          </Button>
                          <Button href={siteVisitHref(project.slug)} variant="secondary" size="sm">
                            Schedule Site Visit
                          </Button>
                          <button
                            type="button"
                            onClick={() => removeCompare(project.slug)}
                            className="inline-flex items-center justify-center gap-1.5 py-1 text-xs text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-primary)]"
                          >
                            <X className="size-3.5" />
                            Remove {project.name}
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-5 max-w-3xl text-xs leading-relaxed text-[color:var(--text-muted)]">
              {DISCLAIMERS.intelligence}
            </p>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-[color:var(--text-muted)]">
              “On request” means the project owner has not released that figure yet. Your advisor can
              request it directly.
            </p>
          </>
        )}
      </Container>
    </Section>
  );
}
