import { HeroMontage } from "@/components/purchase/hero-montage";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RevealLines } from "@/components/motion/reveal";
import { categories } from "@/lib/catalog";

export function PurchaseHero() {
  return (
    <section
      aria-label="Real estate, curated"
      className="grain relative flex min-h-[86svh] flex-col justify-end overflow-hidden bg-carbon-950 pb-14 pt-32 text-bone-100 sm:pb-20 lg:min-h-[100svh] lg:pb-24 lg:pt-40"
    >
      <HeroMontage frames={categories.map((category) => category.hero.src)} />

      <Container width="wide" className="relative z-10">
        <Eyebrow withRule className="text-gold-300">
          TokenZameen · Purchase
        </Eyebrow>

        <h1 className="mt-7 max-w-[14ch] text-display-2xl uppercase text-bone-50">
          <RevealLines lines={["Real estate,", "curated."]} delay={0.15} />
        </h1>

        <p className="mt-7 max-w-xl text-base leading-relaxed text-steel-200 sm:mt-8 sm:text-lg">
          Discover exceptional homes, investment opportunities, land and communities —
          thoughtfully selected by TokenZameen.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
          <Button href="/purchase/properties" size="lg" className="w-full sm:w-auto">
            Explore Properties
          </Button>
          <Button href="/advisory" variant="secondary" size="lg" className="w-full sm:w-auto">
            Talk to an Advisor
          </Button>
        </div>

        <div aria-hidden className="mt-12 flex items-center gap-4 sm:mt-16">
          <span className="eyebrow text-steel-400">Scroll</span>
          <span className="h-px w-14 bg-gradient-to-r from-gold-400/70 to-transparent sm:w-20" />
        </div>
      </Container>
    </section>
  );
}
