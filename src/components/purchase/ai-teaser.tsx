import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PromptRotator } from "@/components/purchase/prompt-rotator";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";

const PROMPTS = [
  "Show me villas under ₹3 crore",
  "Which properties have rental income potential?",
  "I want a plot for long-term investment",
];

export function AiTeaser() {
  return (
    <Section id="ai" tone="bone" aria-label="TokenZameen AI" space="xl">
      <Container width="default">
        <Reveal className="text-center">
          <IndexLabel index="07" className="justify-center">
            TokenZameen AI
          </IndexLabel>
          <h2 className="mx-auto mt-6 max-w-[18ch] text-display-lg text-[color:var(--text-primary)]">
            Tell us what you&rsquo;re looking for.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[color:var(--text-secondary)]">
            Describe the property in your own words and TokenZameen AI narrows the collection to
            what matches. It helps you find things — it does not give investment advice.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <Link
            href="/advisory#ai"
            className="group mx-auto mt-10 flex w-full max-w-2xl items-center gap-4 rounded-card bg-[color:var(--surface)] p-3 pl-5 text-left shadow-lift transition-transform duration-500 ease-[var(--ease-luxe)] hover:-translate-y-0.5 sm:gap-5 sm:p-4 sm:pl-7"
          >
            <Sparkles className="size-5 shrink-0 text-[color:var(--accent)]" aria-hidden />
            <span
              aria-hidden
              className="min-w-0 flex-1 text-base text-[color:var(--text-secondary)] sm:text-lg"
            >
              <PromptRotator prompts={PROMPTS} />
            </span>
            <span className="sr-only">
              Open TokenZameen AI and describe what you are looking for. For example:{" "}
              {PROMPTS[0]}
            </span>
            <TileArrow tone="solid" />
          </Link>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 text-center text-xs text-[color:var(--text-muted)]">
            Opens the TokenZameen AI advisor.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
