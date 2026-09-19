import { LineReveal } from "@/components/interactions/line-reveal";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";

/**
 * The brief's own positioning statements, cycled with the line-reveal mechanic.
 * There are no client testimonials on file and none are invented.
 */
const STATEMENTS = [
  {
    id: "philosophy",
    text: "Don't search through thousands of properties. Discover the ones worth exploring.",
    attribution: "The TokenZameen philosophy",
  },
  {
    id: "more-than-listings",
    text: "TokenZameen is not merely showing you properties. It helps you discover, understand, evaluate and acquire real estate.",
    attribution: "From the product brief",
  },
  {
    id: "verified",
    text: "Not every property belongs on TokenZameen.",
    attribution: "The Verified standard",
  },
  {
    id: "curated",
    text: "Real estate, curated. Exceptional homes, investment opportunities, land and communities — thoughtfully selected.",
    attribution: "Positioning",
  },
];

export function StatementsBand({ index = "06" }: { index?: string }) {
  return (
    <Section tone="paper" space="lg" aria-label="What TokenZameen stands for">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <IndexLabel index={index}>In our words</IndexLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <LineReveal statements={STATEMENTS} label="TokenZameen statements" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
