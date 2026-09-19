import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { Reveal, RevealLines } from "@/components/motion/reveal";
import { accentRule, accentText, accentWash } from "@/components/category/accent";
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
    <Section
      tone="dark"
      space="none"
      aria-label={`${category.name} introduction`}
      className={cn(
        "grain isolate flex items-end overflow-hidden",
        quiet
          ? "min-h-[40rem] sm:min-h-[46rem] lg:min-h-[92svh]"
          : "min-h-[36rem] sm:min-h-[42rem] lg:min-h-[86svh]",
      )}
    >
      <Image
        src={category.hero.src}
        alt={category.hero.alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-t",
          quiet
            ? "from-carbon-950 via-carbon-950/70 to-carbon-950/35"
            : "from-carbon-950 via-carbon-950/80 to-carbon-950/45",
        )}
      />
      <div
        aria-hidden
        className={cn("absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t to-transparent", accentWash(category.accent))}
      />

      <Container width="wide" className="relative pb-16 pt-[calc(72px+3.5rem)] sm:pb-24 lg:pb-28">
        <Reveal mode="fade" duration={quiet ? 1.1 : 0.6}>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-steel-300">
              <li>
                <Link href="/purchase" className="transition-colors hover:text-bone-100">
                  Purchase
                </Link>
              </li>
              <li aria-hidden className="flex items-center">
                <ChevronRight className="size-3.5 opacity-50" />
              </li>
              <li className="text-bone-100" aria-current="page">
                {category.name}
              </li>
            </ol>
          </nav>
        </Reveal>

        <div className={cn("mt-8", quiet && "mt-12")}>
          <Eyebrow className={accentText(category.accent)}>
            {category.index} — {category.name}
          </Eyebrow>
        </div>

        <h1
          className={cn(
            "mt-6 max-w-5xl text-balance",
            quiet ? "text-display-xl font-normal" : "text-display-2xl",
          )}
        >
          <RevealLines lines={headlineLines} delay={quiet ? 0.2 : 0.05} />
        </h1>

        <Reveal mode="fade" delay={quiet ? 0.7 : 0.35} duration={quiet ? 1.2 : 0.8}>
          <p
            className={cn(
              "mt-8 max-w-2xl text-balance text-base text-steel-200 sm:text-lg",
              quiet && "mt-10 leading-loose",
            )}
          >
            {category.heroSubline}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
            <span aria-hidden className={cn("h-px w-10", accentRule(category.accent))} />
            <p className="eyebrow text-steel-300">{countLabel(projectCount)}</p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
              href="#collection"
              variant={quiet ? "glass" : "primary"}
              size="lg"
            >
              {projectCount === 0 ? "Register your interest" : category.cta}
            </Button>
            <Button href={`/purchase/properties?category=${category.slug}`} variant="secondary" size="lg">
              Open the discovery engine
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
