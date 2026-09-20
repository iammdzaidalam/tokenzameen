import Image from "next/image";
import { PopularSearches } from "@/components/search/popular-searches";
import { SearchCard } from "@/components/search/search-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { RevealLines } from "@/components/motion/reveal";

export function PurchaseHero({ cities }: { cities: string[] }) {
  return (
    <Section tone="bone" space="none" aria-label="Real estate, curated" className="pb-16 pt-3 sm:pt-5">
      <Container width="wide">
        <div className="relative">
          <div
            data-surface="dark"
            className="relative flex min-h-[62svh] flex-col items-center justify-center overflow-hidden rounded-frame bg-bone-200 px-5 pb-28 pt-16 text-center text-white sm:px-10 lg:min-h-[76vh] lg:pb-[18rem]"
          >
            <Image
              src="/photos/photo-1781795414968-8ece31826420.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-carbon-950/70 via-carbon-950/20 to-carbon-950/10" />

            <div className="relative z-10 flex flex-col items-center">
              <p className="eyebrow text-bone-100/70">TokenZameen · Purchase</p>

              <h1 className="mt-6 max-w-[15ch] text-display-2xl uppercase text-bone-50">
                <RevealLines lines={["Real estate,", "curated."]} delay={0.15} />
              </h1>

              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-bone-200/90 sm:text-lg">
                Discover exceptional homes, investment opportunities, land and communities —
                thoughtfully selected by TokenZameen.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button href="/purchase/properties" size="md" className="bg-bone-50 text-carbon-950 shadow-none hover:bg-white">
                  Explore Properties
                </Button>
                <Button
                  href="/advisory"
                  variant="glass"
                  size="md"
                  className="border-white/25 bg-white/10 text-bone-50 hover:bg-white/18"
                >
                  Talk to an Advisor
                </Button>
              </div>
            </div>
          </div>

          <div className="relative z-20 -mt-20 lg:-mt-[16rem] lg:px-10">
            <SearchCard cities={cities} />
            <PopularSearches
              className="mt-5"
              labelClassName="lg:text-bone-100/80"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
