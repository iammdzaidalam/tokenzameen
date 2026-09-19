import Link from "next/link";
import { CalendarClock, ChevronRight, MapPin } from "lucide-react";
import { CompareButton } from "@/components/property/compare-button";
import { SaveButton } from "@/components/property/save-button";
import { HeroMedia } from "@/components/property/detail/hero-media";
import { RequestButton } from "@/components/property/detail/request-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RevealLines } from "@/components/motion/reveal";
import { formatPriceFrom } from "@/lib/format";
import { AVAILABILITY_LABEL, CATEGORY_LABEL, SPECIAL_TAG_LABEL } from "@/lib/labels";
import type { Project } from "@/types/catalog";

const AVAILABILITY_TONE = {
  available: "success",
  limited: "warning",
  "coming-soon": "neutral",
  "sold-out": "danger",
} as const;

export function DetailHero({ project }: { project: Project }) {
  const category = CATEGORY_LABEL[project.primaryCategory];

  return (
    <section
      id="hero"
      data-surface="dark"
      aria-label={`${project.name} introduction`}
      className="grain relative isolate flex min-h-[88svh] flex-col overflow-hidden bg-carbon-950 text-bone-100"
    >
      <HeroMedia src={project.hero.src} alt={project.hero.alt} />

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-carbon-950 via-carbon-950/60 to-carbon-950/30"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-carbon-950/85 via-carbon-950/25 to-transparent"
      />

      <Container width="wide" className="relative z-10 flex flex-1 flex-col pb-14 pt-[calc(72px+2rem)] sm:pb-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-steel-300">
            <li>
              <Link href="/purchase" className="transition-colors hover:text-bone-100">
                Purchase
              </Link>
            </li>
            <li aria-hidden className="text-steel-500">
              <ChevronRight className="size-3" />
            </li>
            <li>
              <Link
                href={`/purchase/${project.primaryCategory}`}
                className="transition-colors hover:text-bone-100"
              >
                {category}
              </Link>
            </li>
            <li aria-hidden className="text-steel-500">
              <ChevronRight className="size-3" />
            </li>
            <li aria-current="page" className="text-bone-100">
              {project.name}
            </li>
          </ol>
        </nav>

        <div className="mt-auto pt-16">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <Eyebrow className="text-gold-300">{category}</Eyebrow>
            <Badge tone={AVAILABILITY_TONE[project.availability]}>
              {AVAILABILITY_LABEL[project.availability]}
            </Badge>
          </div>

          <h1 className="mt-5 text-display-2xl text-bone-50">
            <RevealLines lines={[project.name]} />
          </h1>

          <p className="mt-6 flex items-center gap-2 text-sm text-steel-200 sm:text-base">
            <MapPin aria-hidden className="size-4 shrink-0 opacity-70" />
            {project.location.label}
          </p>

          <p className="mt-8 max-w-2xl font-subhead text-lg leading-snug text-bone-200 sm:text-xl">
            {project.positioning}
          </p>

          <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
            <div>
              <p className="eyebrow text-steel-400">Price</p>
              <p className="tabular mt-2 font-display text-display-sm text-gold-200">
                {formatPriceFrom(project.priceFrom)}
              </p>
              {project.priceNote ? (
                <p className="mt-2 max-w-md text-xs leading-relaxed text-steel-400">{project.priceNote}</p>
              ) : null}
            </div>

            {project.specialTags.length > 0 ? (
              <ul className="flex flex-wrap gap-2 sm:justify-end">
                {project.specialTags.map((tag) => (
                  <li key={tag}>
                    <Badge tone="gold">{SPECIAL_TAG_LABEL[tag]}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <RequestButton
              subject="the full project details"
              variant="primary"
              size="lg"
              className="max-sm:w-full"
            >
              Request Details
            </RequestButton>
            <Button
              href="#site-visit"
              variant="glass"
              size="lg"
              className="max-sm:w-full"
            >
              <CalendarClock aria-hidden className="size-4" />
              Schedule Site Visit
            </Button>
            <div className="flex items-center gap-3 sm:ml-2">
              <SaveButton slug={project.slug} name={project.name} />
              <CompareButton slug={project.slug} name={project.name} withLabel className="glass" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
