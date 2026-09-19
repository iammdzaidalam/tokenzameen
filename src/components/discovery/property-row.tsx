"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { siteVisitHref } from "@/components/discovery/advisory";
import { CompareButton } from "@/components/property/compare-button";
import { SaveButton } from "@/components/property/save-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatArea, formatPriceFrom } from "@/lib/format";
import { AVAILABILITY_LABEL, CATEGORY_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/labels";
import type { Project } from "@/types/catalog";

const AVAILABILITY_TONE = {
  available: "success",
  limited: "warning",
  "coming-soon": "neutral",
  "sold-out": "danger",
} as const;

/** The scanning layout for the list view. Same fields as the card, laid out for
 *  comparison down a column rather than for browsing across a grid. */
export function PropertyRow({
  project,
  priority = false,
  className,
}: {
  project: Project;
  priority?: boolean;
  className?: string;
}) {
  const href = `/purchase/${project.slug}`;
  const verified = Object.values(project.verified).filter(Boolean).length >= 3;

  const specs = [
    { label: "Price", value: formatPriceFrom(project.priceFrom) },
    { label: "Size", value: formatArea(project.area) },
    {
      label: "Type",
      value: project.propertyTypes.map((type) => PROPERTY_TYPE_LABEL[type]).join(" · "),
    },
  ];

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-5 rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-4 transition-[border-color,box-shadow] duration-500 ease-[var(--ease-luxe)] hover:border-[color:var(--hairline-strong)] hover:shadow-lift sm:flex-row sm:items-stretch",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-bone-200 sm:aspect-auto sm:h-auto sm:w-60">
        <Image
          src={project.hero.src}
          alt={project.hero.alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, 240px"
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-luxe)] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {verified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[0.625rem] font-medium text-carbon-900 backdrop-blur-sm">
              <ShieldCheck className="size-3 text-gold-600" />
              Verified
            </span>
          ) : (
            <span />
          )}
          <SaveButton slug={project.slug} name={project.name} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 sm:py-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow text-[color:var(--text-muted)]">
              {CATEGORY_LABEL[project.primaryCategory]}
            </p>
            <Badge tone={AVAILABILITY_TONE[project.availability]}>
              {AVAILABILITY_LABEL[project.availability]}
            </Badge>
          </div>

          <h3 className="mt-2 text-display-sm">
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {project.name}
            </Link>
          </h3>

          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[color:var(--text-secondary)]">
            <MapPin className="size-3.5 shrink-0 opacity-60" />
            {project.location.label}
          </p>

          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
            {project.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-5">
          <dl className="flex flex-wrap items-center gap-x-6 gap-y-3 divide-x divide-[color:var(--hairline)]">
            {specs.map((spec, index) => (
              <div key={spec.label} className={cn(index > 0 && "pl-6")}>
                <dt className="eyebrow text-[color:var(--text-muted)]">{spec.label}</dt>
                <dd className="mt-1 text-[0.8125rem] text-[color:var(--text-primary)]">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <CompareButton slug={project.slug} name={project.name} />
            <Link
              href={siteVisitHref(project.slug)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] px-4 text-[0.8125rem] text-[color:var(--text-secondary)] transition-colors hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]"
            >
              Schedule a Visit
            </Link>
            <Link
              href={href}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[color:var(--text-primary)] px-5 text-[0.8125rem] font-medium text-[color:var(--surface)] transition-opacity hover:opacity-90"
            >
              View Property
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
