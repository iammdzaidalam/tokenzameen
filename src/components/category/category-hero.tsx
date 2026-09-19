import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/catalog";

/** "Space. Privacy. Ownership." reads best as three rising lines; a single
 *  sentence stays on one. */
function toLines(headline: string): string[] {
  const parts = headline.match(/[^.]+\.?/g);
  if (!parts) return [headline];
  const sentences = parts.map((part) => part.trim()).filter(Boolean);
  return sentences.length > 1 ? sentences : [headline];
}

function countLabel(count: number): string {
  if (count === 0) return "Collection in preparation";
  if (count === 1) return "1 project published";
  return `${count} projects published`;
}

export function CategoryHero({
  category,
  projectCount,
  quiet = false,
}: {
  category: Category;
  projectCount: number;
  quiet?: boolean;
}) {
  const headlineLines = toLines(category.heroHeadline);

  return (
    <Section tone="bone" space="none" aria-label={`${category.name} introduction`} className="pb-4 pt-6 sm:pt-8">
      <Container width="wide">
        <AccentScope accent={category.accent} tone="light">
          <Reveal mode="fade" duration={quiet ? 1 : 0.6}>
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
                  <li className="text-[color:var(--text-primary)]" aria-current="page">
                    {category.name}
                  </li>
                </ol>
              </nav>
              <p className="eyebrow text-[color:var(--text-muted)]">{countLabel(projectCount)}</p>
            </div>

            <div className="mt-6 sm:mt-8">
              <IndexLabel index={category.index}>{category.name}</IndexLabel>
            </div>
          </Reveal>
        </AccentScope>

        <div
          data-surface="dark"
          className={cn(
            "grain relative mt-5 flex overflow-hidden rounded-frame bg-carbon-950 text-bone-100",
            quiet
              ? "min-h-[30rem] sm:min-h-[62svh] lg:min-h-[70svh]"
              : "min-h-[28rem] sm:min-h-[60svh] lg:min-h-[68svh]",
          )}
        >
          <Image
            src={category.hero.src}
            alt={category.hero.alt}
            fill
            priority
            sizes="(max-width: 1664px) 100vw, 1664px"
            className="object-cover"
          />
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 bg-gradient-to-t",
              quiet
                ? "from-carbon-950/85 via-carbon-950/40 to-carbon-950/15"
                : "from-carbon-950/90 via-carbon-950/45 to-carbon-950/20",
            )}
          />

          <div className="relative flex w-full flex-col justify-end p-6 sm:p-10 lg:p-14">
            <h1
              className={cn(
                "max-w-[13ch] text-balance text-[color:var(--text-primary)]",
                quiet ? "text-display-xl font-normal" : "text-display-2xl",
              )}
            >
              <RevealLines lines={headlineLines} delay={quiet ? 0.2 : 0.05} />
            </h1>

            <Reveal mode="fade" delay={quiet ? 0.7 : 0.35} duration={quiet ? 1.2 : 0.8}>
              <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <p
                  className={cn(
                    "max-w-xl text-pretty text-base text-[color:var(--text-secondary)] sm:text-lg",
                    quiet && "leading-loose",
                  )}
                >
                  {category.heroSubline}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button href="#collection" variant="solid" size="lg" className="w-full sm:w-auto">
                    {projectCount === 0 ? "Register your interest" : category.cta}
                  </Button>
                  <Button
                    href={`/purchase/properties?category=${category.slug}`}
                    variant="glass"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Open the discovery engine
                  </Button>
                </div>
              </div>

            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
