import Image from "next/image";
import Link from "next/link";
import { RevealLines, Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";
import { SITE } from "@/content/config";
import { categories, getAllProjects, getFeaturedProjects } from "@/lib/catalog";
import { formatPriceFrom } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/labels";

export function HomeHero() {
  const projects = getAllProjects();
  const highlight = getFeaturedProjects()[0] ?? projects[0] ?? null;
  const backdrop = categories.find((category) => category.slug === "villas") ?? categories[0];
  const [lead, tail] = SITE.tagline.split(", ");
  const lines = tail ? [`${lead},`, tail] : [SITE.tagline];

  return (
    <Section tone="bone" space="none" aria-label={SITE.tagline} className="pb-16 pt-3 sm:pt-5">
      <Container width="wide">
        <div
          data-surface="dark"
          className="grain relative flex min-h-[70svh] flex-col justify-between overflow-hidden rounded-frame bg-carbon-950 text-bone-100 lg:min-h-[78vh]"
        >
          {backdrop ? (
            <Image
              src={backdrop.hero.src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-80"
            />
          ) : null}
          <div aria-hidden className="absolute inset-0 bg-carbon-950/45" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_10%,rgba(6,6,7,0.55)_65%,#060607_100%)]"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-carbon-950 via-carbon-950/70 to-transparent" />

          <div className="relative z-10 flex items-center justify-between gap-4 p-6 sm:p-10 lg:p-12">
            <p className="eyebrow flex items-center gap-2 text-bone-100/75">
              <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
              {projects.length} properties · {categories.length} collections
            </p>
            <Link
              href="/verified"
              className="hidden text-xs text-bone-200/80 underline-offset-4 transition-colors hover:text-bone-50 hover:underline sm:block"
            >
              TokenZameen Verified
            </Link>
          </div>

          <div className="relative z-10 grid gap-10 p-6 pt-16 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end lg:p-12">
            <div>
              <h1 className="max-w-[10ch] text-display-2xl lowercase text-bone-50">
                <RevealLines lines={lines} delay={0.1} />
              </h1>
              <Reveal mode="fade" delay={0.45} duration={0.9}>
                <p className="mt-7 max-w-xl text-balance text-base leading-relaxed text-bone-200/90 sm:text-lg">
                  {SITE.description}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <Button href="/purchase/properties" size="lg" className="w-full sm:w-auto">
                    Explore Properties
                  </Button>
                  <Button href="/advisory" variant="glass" size="lg" className="w-full sm:w-auto">
                    Talk to an Advisor
                  </Button>
                </div>
              </Reveal>
            </div>

            {highlight ? (
              <Reveal mode="up" delay={0.6}>
                <Link
                  href={`/purchase/${highlight.slug}`}
                  data-surface="light"
                  className="group flex items-center gap-4 rounded-card bg-white p-3 pr-4 text-carbon-900 shadow-lift transition-transform duration-500 ease-[var(--ease-luxe)] hover:-translate-y-1"
                >
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-bone-200">
                    <Image
                      src={highlight.hero.src}
                      alt={highlight.hero.alt}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="eyebrow block text-steel-500">In the collection</span>
                    <span className="mt-1 block truncate font-display text-base">{highlight.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-carbon-500">
                      {CATEGORY_LABEL[highlight.primaryCategory]} · {highlight.location.label}
                    </span>
                    <span className="mt-1.5 block text-sm">{formatPriceFrom(highlight.priceFrom)}</span>
                  </span>
                  <TileArrow size="sm" tone="solid" />
                </Link>
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
