import { Reveal } from "@/components/motion/reveal";
import { ShortlistSummary } from "@/components/purchase/shortlist-summary";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";

export function CompareTeaser() {
  return (
    <Section id="compare" tone="bone" aria-label="Compare properties" space="lg">
      <Container width="wide">
        <Reveal>
          <div className="rounded-card bg-[color:var(--surface)] p-8 shadow-lift sm:p-12 lg:p-16">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <IndexLabel index="08">Compare properties</IndexLabel>
                <h2 className="mt-6 text-display-lg text-[color:var(--text-primary)]">
                  Shortlist. Compare. Decide.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[color:var(--text-secondary)]">
                  Save what holds your attention, put up to four properties side by side, and read
                  them on the same terms — type, location, size, price and availability, with the
                  gaps left visible.
                </p>
                <ShortlistSummary />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0 lg:flex-col xl:flex-row">
                <Button href="/purchase/compare" variant="solid" size="lg" className="w-full sm:w-auto">
                  Open comparison
                </Button>
                <Button
                  href="/purchase/shortlist"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  View shortlist
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
