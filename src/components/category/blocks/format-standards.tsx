import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHead } from "@/components/category/section-head";
import { accentText } from "@/components/category/accent";
import { cn } from "@/lib/cn";
import type { Accent } from "@/components/category/accent";

interface Standard {
  title: string;
  questions: string[];
}

const APARTMENTS: Standard[] = [
  {
    title: "Build quality",
    questions: [
      "Who has built here before, and what does that project look like five years after handover?",
      "Does the specification sheet survive a walk through the sample home?",
      "What sits behind the finish — structure, waterproofing, services, lifts?",
    ],
  },
  {
    title: "Layout efficiency",
    questions: [
      "How much of the built-up area is floor you can actually stand on?",
      "Where does the light come from at four in the afternoon?",
      "Does the plan still work when the household changes shape?",
    ],
  },
  {
    title: "Location depth",
    questions: [
      "What already exists around this address, as distinct from what is promised?",
      "How does someone get to work from here on an ordinary Tuesday?",
      "Who else is building nearby, and what does that do to supply?",
    ],
  },
  {
    title: "Resale and letting demand",
    questions: [
      "Who is the next buyer, and is there evidence they are in this micro-market today?",
      "What is letting here now, and to whom?",
      "How long does a resale take to clear once it is listed?",
    ],
  },
];

const VILLAS: Standard[] = [
  {
    title: "Build and finish",
    questions: [
      "Has the developer delivered a villa at this scale before, or only apartments?",
      "What is specified for the parts nobody photographs — roof, drainage, boundary, services?",
      "How is the house built to age in this climate?",
    ],
  },
  {
    title: "Plot and layout efficiency",
    questions: [
      "How much of the plot is house, and how much of it stays yours?",
      "Where do the neighbouring windows look, and from what distance?",
      "Does the plan work with guests, staff, storage and a car that has to turn?",
    ],
  },
  {
    title: "Location depth",
    questions: [
      "What is the last mile like in the monsoon, and who maintains it?",
      "What sits within a genuine drive — healthcare, schooling, a market that stays open?",
      "What is the land next door zoned to become?",
    ],
  },
  {
    title: "Resale and letting demand",
    questions: [
      "Is there a real second-home market here, or a seller's account of one?",
      "What lets, in which season, and at what occupancy?",
      "How deep is the buyer pool on the day you want to exit?",
    ],
  },
];

export function FormatStandards({
  variant,
  accent,
}: {
  variant: "apartments" | "villas";
  accent: Accent;
}) {
  const standards = variant === "apartments" ? APARTMENTS : VILLAS;
  const title =
    variant === "apartments"
      ? "What we ask of an apartment."
      : "What we ask of a villa.";
  const lede =
    variant === "apartments"
      ? "Curation is mostly a question set. Before an apartment project joins the collection, these are the questions the team works through with the developer — and the ones an advisor will answer for you, in writing."
      : "A villa is a longer commitment than a flat, and the things that go wrong are slower to surface. These are the questions the team works through before a project joins the collection.";

  return (
    <Section tone="light" space="lg" aria-labelledby="standards-heading">
      <Container width="wide">
        <SectionHead
          id="standards-heading"
          eyebrow="The standard"
          title={title}
          lede={lede}
          accent={accent}
          tone="light"
        />

        <RevealGroup className="mt-14 grid gap-x-12 gap-y-12 sm:mt-16 md:grid-cols-2 lg:gap-x-20">
          {standards.map((standard, index) => (
            <RevealItem key={standard.title}>
              <div className="flex items-baseline gap-4">
                <span className={cn("eyebrow tabular", accentText(accent, "light"))}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-display-sm text-[color:var(--text-primary)]">{standard.title}</h3>
              </div>
              <ul className="mt-6 space-y-4 border-t border-[color:var(--hairline)] pt-6">
                {standard.questions.map((question) => (
                  <li
                    key={question}
                    className="flex gap-3 text-pretty text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]"
                  >
                    <span aria-hidden className={cn("mt-2.5 h-px w-4 shrink-0", accentText(accent, "light"), "bg-current")} />
                    {question}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="mt-14 max-w-3xl border-t border-[color:var(--hairline)] pt-6 text-sm leading-relaxed text-[color:var(--text-secondary)]">
          We publish an answer only where documentation supports it. Where a project owner has not
          supplied something yet, the project page lists it as information being compiled rather than
          filling the gap.
        </p>
      </Container>
    </Section>
  );
}
