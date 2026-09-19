import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";

const STEPS = [
  {
    index: "01",
    title: "Express Interest",
    body: "Tell us the property, your budget, purpose and when you would like a callback.",
  },
  {
    index: "02",
    title: "Property Advisor Connects",
    body: "An advisor picks up the requirement and answers the first round of questions.",
  },
  {
    index: "03",
    title: "Documentation & Verification",
    body: "Project papers are gathered and shared for your review, including what is still pending.",
  },
  {
    index: "04",
    title: "Site Visit",
    body: "See the project in person, at a time you choose.",
  },
  {
    index: "05",
    title: "Unit / Plot Selection",
    body: "Choose the specific unit or plot against the developer's released inventory.",
  },
  {
    index: "06",
    title: "Booking / Purchase",
    body: "The booking is placed with the developer on their published terms.",
  },
  {
    index: "07",
    title: "Documentation",
    body: "Agreements are drawn up, reviewed and executed.",
  },
  {
    index: "08",
    title: "Transaction Completion",
    body: "Payment and handover close the purchase.",
  },
];

export function AdvisoryJourney() {
  return (
    <Section id="advisory" tone="darker" aria-label="TokenZameen Advisory" space="xl">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <IndexLabel index="09">TokenZameen Advisory</IndexLabel>
              <h2 className="mt-6 max-w-[14ch] text-display-xl text-[color:var(--text-primary)]">
                From discovery to acquisition.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--text-secondary)] lg:pb-3 lg:text-right">
              A purchase here does not begin with a payment. It begins with a conversation, and an
              advisor stays with it to the end.
            </p>
          </div>
        </Reveal>

        <RevealGroup as="ol" stagger={0.06} className="mt-14 lg:mt-20 lg:grid lg:grid-cols-8">
          {STEPS.map((step) => (
            <RevealItem
              as="li"
              key={step.index}
              className="relative border-l border-[color:var(--hairline)] pb-8 pl-6 last:border-l-transparent last:pb-0 lg:border-l-0 lg:border-t lg:border-[color:var(--hairline)] lg:pb-0 lg:pl-0 lg:pr-5 lg:pt-6"
            >
              <span
                aria-hidden
                className="absolute left-0 top-1.5 size-2 -translate-x-1/2 rounded-full bg-[color:var(--accent)] lg:top-0 lg:-translate-y-1/2 lg:translate-x-0"
              />
              <span className="eyebrow tabular text-[color:var(--accent)]">/{step.index}</span>
              <h3 className="mt-3 font-display text-base text-[color:var(--text-primary)] lg:text-[0.9375rem]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-[color:var(--text-secondary)] lg:text-[0.8125rem]">
                {step.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-16 border-t border-[color:var(--hairline)] pt-14 text-center lg:mt-24 lg:pt-20">
          <h3 className="mx-auto max-w-[18ch] text-display-md text-[color:var(--text-primary)]">
            Not sure where to start?
          </h3>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[color:var(--text-secondary)]">
            Tell us your requirements — budget, location, property type, purpose and timeline — and
            a TokenZameen advisor will help you navigate the collection.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button href="/purchase/properties" variant="solid" size="lg" className="w-full sm:w-auto">
              Find Your Property
            </Button>
            <Button href="/advisory" variant="secondary" size="lg" className="w-full sm:w-auto">
              Talk to an Advisor
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
