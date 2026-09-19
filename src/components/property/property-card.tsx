import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompareButton } from "@/components/property/compare-button";
import { SaveButton } from "@/components/property/save-button";
import { cn } from "@/lib/cn";
import { formatArea, formatPriceFrom } from "@/lib/format";
import { AVAILABILITY_LABEL, CATEGORY_LABEL, PROPERTY_TYPE_LABEL, SPECIAL_TAG_LABEL } from "@/lib/labels";
import type { Project } from "@/types/catalog";

type Variant = "default" | "feature" | "compact";

const AVAILABILITY_TONE = {
  available: "success",
  limited: "warning",
  "coming-soon": "neutral",
  "sold-out": "danger",
} as const;

function SpecRow({ project }: { project: Project }) {
  const specs = [
    { label: "Size", value: formatArea(project.area) },
    {
      label: "Type",
      value: project.propertyTypes.map((t) => PROPERTY_TYPE_LABEL[t]).join(" · "),
    },
    { label: "Status", value: AVAILABILITY_LABEL[project.availability] },
  ];

  return (
    <dl className="grid grid-cols-3 divide-x divide-[color:var(--hairline)] border-y border-[color:var(--hairline)]">
      {specs.map((spec) => (
        <div key={spec.label} className="px-3 py-3 first:pl-0 last:pr-0">
          <dt className="eyebrow text-[color:var(--text-muted)]">{spec.label}</dt>
          <dd className="mt-1.5 truncate text-[0.8125rem] text-[color:var(--text-primary)]" title={spec.value}>
            {spec.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function PropertyCard({
  project,
  variant = "default",
  priority = false,
  className,
}: {
  project: Project;
  variant?: Variant;
  priority?: boolean;
  className?: string;
}) {
  const href = `/purchase/${project.slug}`;
  const verified = Object.values(project.verified).filter(Boolean).length >= 3;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex gap-4 rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-3 transition-colors duration-500 hover:border-[color:var(--hairline-strong)]",
          className,
        )}
      >
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-bone-200">
          <Image
            src={project.hero.src}
            alt={project.hero.alt}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1 py-1">
          <p className="eyebrow text-[color:var(--text-muted)]">
            {CATEGORY_LABEL[project.primaryCategory]}
          </p>
          <p className="mt-1.5 truncate font-display text-base text-[color:var(--text-primary)]">
            {project.name}
          </p>
          <p className="mt-1 truncate text-xs text-[color:var(--text-secondary)]">
            {project.location.label}
          </p>
          <p className="mt-2 text-sm text-[color:var(--text-primary)]">
            {formatPriceFrom(project.priceFrom)}
          </p>
        </div>
      </Link>
    );
  }

  const isFeature = variant === "feature";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] transition-[border-color,transform,box-shadow] duration-500 ease-[var(--ease-luxe)] hover:-translate-y-1 hover:border-[color:var(--hairline-strong)] hover:shadow-lift",
        isFeature && "lg:flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-bone-200",
          isFeature ? "aspect-[4/3] lg:aspect-auto lg:w-[56%]" : "aspect-[4/3]",
        )}
      >
        <Image
          src={project.hero.src}
          alt={project.hero.alt}
          fill
          priority={priority}
          sizes={
            isFeature
              ? "(max-width: 1024px) 100vw, 55vw"
              : "(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 30vw"
          }
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-carbon-950/70 via-carbon-950/5 to-carbon-950/20"
        />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          {verified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[0.6875rem] font-medium tracking-wide text-carbon-900 backdrop-blur-sm">
              <ShieldCheck className="size-3 text-gold-600" />
              TokenZameen Verified
            </span>
          ) : (
            <span />
          )}
          <SaveButton slug={project.slug} name={project.name} />
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3.5 py-2 font-display text-sm text-carbon-900 backdrop-blur-sm">
            {formatPriceFrom(project.priceFrom)}
          </span>
          <div className="flex flex-wrap justify-end gap-2">
            {project.specialTags.slice(0, isFeature ? 2 : 1).map((tag) => (
              <Badge key={tag} tone="outline" className="border-white/45 bg-carbon-950/45 text-bone-100 backdrop-blur-sm">
                {SPECIAL_TAG_LABEL[tag]}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-5 sm:p-6", isFeature && "lg:justify-center lg:p-10")}>
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow text-[color:var(--text-muted)]">
            {CATEGORY_LABEL[project.primaryCategory]}
          </p>
          <Badge tone={AVAILABILITY_TONE[project.availability]}>
            {AVAILABILITY_LABEL[project.availability]}
          </Badge>
        </div>

        <h3 className={cn("mt-3", isFeature ? "text-display-md" : "text-display-sm")}>
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {project.name}
          </Link>
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-[color:var(--text-secondary)]">
          <MapPin className="size-3.5 shrink-0 opacity-60" />
          {project.location.label}
        </p>

        {isFeature ? (
          <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]">
            {project.summary}
          </p>
        ) : null}

        <div className="mt-5">
          <SpecRow project={project} />
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
          <Link
            href={href}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[color:var(--text-primary)] px-5 text-[0.8125rem] font-medium text-[color:var(--surface)] transition-opacity hover:opacity-90"
          >
            View Property
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href={`/advisory?project=${project.slug}&request=site-visit`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] px-4 text-[0.8125rem] text-[color:var(--text-secondary)] transition-colors hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]"
          >
            Schedule a Visit
          </Link>
          <CompareButton slug={project.slug} name={project.name} />
        </div>
      </div>
    </article>
  );
}
