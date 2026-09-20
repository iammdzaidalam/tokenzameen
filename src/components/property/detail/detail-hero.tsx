import Link from "next/link";
import { CalendarClock, ChevronRight, MapPin } from "lucide-react";
import { CompareButton } from "@/components/property/compare-button";
import { SaveButton } from "@/components/property/save-button";
import { HeroMedia } from "@/components/property/detail/hero-media";
import { RequestButton } from "@/components/property/detail/request-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { Reveal, RevealLines } from "@/components/motion/reveal";
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
    <Section
      id="hero"
      tone="bone"
      space="none"
      aria-label={`${project.name} introduction`}
      className="pb-6 pt-6 sm:pt-8 lg:pb-20"
    >
      <Container width="wide">
        <Reveal mode="fade" duration={0.6}>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[color:var(--text-secondary)]">
                <li>
                  <Link href="/purchase" className="transition-colors hover:text-[color:var(--text-primary)]">
                    Purchase
                  </Link>
                </li>
                <li aria-hidden className="flex items-center">
                  <ChevronRight className="size-3.5 opacity-50" />
                </li>
                <li>
                  <Link
                    href={`/purchase/${project.primaryCategory}`}
                    className="transition-colors hover:text-[color:var(--text-primary)]"
                  >
                    {category}
                  </Link>
                </li>
                <li aria-hidden className="flex items-center">
                  <ChevronRight className="size-3.5 opacity-50" />
                </li>
                <li aria-current="page" className="text-[color:var(--text-primary)]">
                  {project.name}
                </li>
              </ol>
            </nav>
            <Badge tone={AVAILABILITY_TONE[project.availability]}>
              {AVAILABILITY_LABEL[project.availability]}
            </Badge>
          </div>

          <div className="mt-6 sm:mt-8">
            <IndexLabel>{category}</IndexLabel>
          </div>
        </Reveal>

        <div className="relative mt-5">
          <div
            data-surface="dark"
            className="relative isolate flex min-h-[28rem] overflow-hidden rounded-frame bg-bone-200 text-white sm:min-h-[60svh] lg:min-h-[70svh]"
          >
            <HeroMedia src={project.hero.src} alt={project.hero.alt} />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-carbon-950/80 via-carbon-950/25 to-transparent"
            />

            <div className="relative flex w-full flex-col justify-end p-6 pb-28 sm:p-10 sm:pb-32 lg:p-14 lg:pr-[26rem]">
              {project.specialTags.length > 0 ? (
                <ul className="mb-6 flex flex-wrap gap-2">
                  {project.specialTags.map((tag) => (
                    <li key={tag}>
                      <Badge tone="outline" className="border-white/40 bg-carbon-950/40 text-bone-100 backdrop-blur-sm">
                        {SPECIAL_TAG_LABEL[tag]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : null}

              <h1 className="max-w-[12ch] text-balance text-display-xl text-[color:var(--text-primary)]">
                <RevealLines lines={[project.name]} delay={0.05} />
              </h1>

              <Reveal mode="fade" delay={0.35} duration={0.8}>
                <p className="mt-6 max-w-xl text-pretty font-subhead text-lg leading-snug text-[color:var(--text-secondary)] sm:text-xl">
                  {project.positioning}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <RequestButton
                    subject="the full project details"
                    variant="solid"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Request Details
                  </RequestButton>
                  <Button href="#site-visit" variant="glass" size="lg" className="w-full sm:w-auto">
                    <CalendarClock aria-hidden className="size-4" />
                    Schedule Site Visit
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal
            mode="up"
            delay={0.5}
            className="relative z-10 mx-4 -mt-20 sm:mx-8 sm:-mt-24 lg:absolute lg:-bottom-12 lg:right-10 lg:mx-0 lg:mt-0 lg:w-[22rem]"
          >
            <div
              data-surface="light"
              className="rounded-card bg-[color:var(--surface)] p-5 text-[color:var(--text-primary)] shadow-lift sm:p-6"
            >
              <p className="eyebrow text-[color:var(--text-muted)]">Starting price</p>
              <p className="tabular mt-2 font-display text-display-sm text-[color:var(--text-primary)]">
                {formatPriceFrom(project.priceFrom)}
              </p>
              {project.priceNote ? (
                <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-muted)]">
                  {project.priceNote}
                </p>
              ) : null}

              <p className="mt-4 flex items-center gap-1.5 border-t border-[color:var(--hairline)] pt-4 text-sm text-[color:var(--text-secondary)]">
                <MapPin aria-hidden className="size-3.5 shrink-0 opacity-60" />
                {project.location.label}
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <CompareButton slug={project.slug} name={project.name} withLabel />
                <SaveButton slug={project.slug} name={project.name} tone="bare" />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
