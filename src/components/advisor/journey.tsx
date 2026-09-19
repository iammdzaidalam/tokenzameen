import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";

/** PRD 02 §23, folded into six columns. */
const STEPS = [
  {
    index: "01",
    title: "Discover & Explore",
    body: "Start with the six collections, the intents, or a question to TokenZameen AI. Explore what fits before anyone calls you.",
  },
  {
    index: "02",
    title: "Save & Compare",
    body: "Shortlist what interests you and set properties side by side on what each has actually published.",
  },
  {
    index: "03",
    title: "Understand",
    body: "Read the documents on file, the investment snapshot and the list of what is still being compiled.",
  },
  {
    index: "04",
    title: "Talk to an Advisor",
    body: "One advisor picks up your requirement, answers the first round of questions and stays with it to the end.",
  },
  {
    index: "05",
    title: "Site Visit & Select",
    body: "See the project in person at a time you choose, then pick the unit or plot against the developer's released inventory.",
  },
  {
    index: "06",
    title: "Verify, Book, Purchase",
    body: "Document verification first. Then the booking on the developer's published terms, then completion.",
  },
];

export function AdvisorJourney() {
  return (
    <Section tone="darker" space="xl" aria-labelledby="journey-heading">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow withRule>The advisor journey</Eyebrow>
              <h2 id="journey-heading" className="mt-6 max-w-[16ch] text-balance text-display-lg">
                How an advisor takes it from here.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--text-secondary)] lg:pb-3 lg:text-right">
              Nothing here begins with a payment. It begins with what you tell us, and every step after
              that is one you can see coming.
            </p>
          </div>
        </Reveal>

        <RevealGroup as="ol" stagger={0.07} className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-6">
          {STEPS.map((step) => (
            <RevealItem
              as="li"
              key={step.index}
              className="relative border-t border-[color:var(--hairline)] pt-6"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 size-2 -translate-y-1/2 rounded-full bg-[color:var(--accent)]"
              />
              <span className="eyebrow tabular text-[color:var(--text-muted)]">{step.index}</span>
              <h3 className="mt-3 font-display text-base text-[color:var(--text-primary)]">{step.title}</h3>
              <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-[color:var(--text-secondary)] lg:text-[0.8125rem]">
                {step.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
