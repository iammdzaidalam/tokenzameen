import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompareButton } from "@/components/property/compare-button";
import { SaveButton } from "@/components/property/save-button";
import { cn } from "@/lib/cn";
import { formatArea, formatPriceFrom } from "@/lib/format";
import { AVAILABILITY_LABEL, CATEGORY_LABEL, SPECIAL_TAG_LABEL } from "@/lib/labels";
import type { Project } from "@/types/catalog";

type Variant = "default" | "feature" | "compact";

const AVAILABILITY_TONE = {
  available: "success",
  limited: "warning",
  "coming-soon": "neutral",
  "sold-out": "danger",
} as const;

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
  const tags = project.specialTags.slice(0, variant === "compact" ? 1 : 2);

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex gap-4 rounded-card border border-[color:var(--hairline)] p-3 transition-colors duration-500 hover:border-[color:var(--hairline-strong)]",
          className,
        )}
      >
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-carbon-800">
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
          <p className="mt-2 text-sm text-[color:var(--accent)]">{formatPriceFrom(project.priceFrom)}</p>
        </div>
      </Link>
    );
  }

  const isFeature = variant === "feature";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] transition-[border-color,transform] duration-500 ease-[var(--ease-luxe)] hover:-translate-y-1 hover:border-[color:var(--hairline-strong)]",
        isFeature && "lg:flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-carbon-800",
          isFeature ? "aspect-[4/3] lg:aspect-auto lg:w-[58%]" : "aspect-[4/3]",
        )}
      >
        <Image
          src={project.hero.src}
          alt={project.hero.alt}
          fill
          priority={priority}
          sizes={isFeature ? "(max-width: 1024px) 100vw, 55vw" : "(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 30vw"}
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-carbon-950/85 via-carbon-950/10 to-transparent"
        />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {verified ? (
              <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.6875rem] font-medium tracking-wide text-bone-100">
                <ShieldCheck className="size-3 text-gold-300" />
                TokenZameen Verified
              </span>
            ) : null}
          </div>
          <SaveButton slug={project.slug} name={project.name} />
        </div>

        <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} tone="gold">
              {SPECIAL_TAG_LABEL[tag]}
            </Badge>
          ))}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-6", isFeature && "lg:justify-center lg:p-10")}>
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

        <dl className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3 border-t border-[color:var(--hairline)] pt-5">
          <div>
            <dt className="eyebrow text-[color:var(--text-muted)]">Price</dt>
            <dd className="mt-1.5 font-display text-lg text-[color:var(--text-primary)]">
              {formatPriceFrom(project.priceFrom)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-[color:var(--text-muted)]">Size</dt>
            <dd className="mt-1.5 font-display text-lg text-[color:var(--text-primary)]">
              {formatArea(project.area)}
            </dd>
          </div>
        </dl>

        <div className="relative z-10 mt-6 flex items-center justify-between gap-4">
          <CompareButton slug={project.slug} name={project.name} withLabel />
          <span className="inline-flex items-center gap-1.5 text-sm text-[color:var(--accent)]">
            Explore Property
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
