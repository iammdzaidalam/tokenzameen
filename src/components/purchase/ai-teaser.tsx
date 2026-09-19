import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PromptRotator } from "@/components/purchase/prompt-rotator";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";

const PROMPTS = [
  "Show me villas under ₹3 crore",
  "Which properties have rental income potential?",
  "I want a plot for long-term investment",
];

export function AiTeaser() {
  return (
    <Section id="ai" tone="darker" aria-label="TokenZameen AI" space="xl" className="overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(201,169,97,0.12),transparent_70%)]"
      />
      <Container width="default" className="relative">
        <Reveal className="text-center">
          <Eyebrow className="justify-center">TokenZameen AI</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-[18ch] text-display-lg">
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
            className="group mx-auto mt-10 flex w-full max-w-2xl items-center gap-4 rounded-panel border border-[color:var(--hairline-strong)] bg-[color:var(--surface-raised)]/70 p-3 pl-5 text-left backdrop-blur-xl transition-[border-color,transform] duration-500 ease-[var(--ease-luxe)] hover:-translate-y-0.5 hover:border-gold-400/50 sm:gap-5 sm:p-4 sm:pl-7"
          >
            <Sparkles className="size-5 shrink-0 text-gold-300" aria-hidden />
            <span aria-hidden className="min-w-0 flex-1 text-base text-[color:var(--text-secondary)] sm:text-lg">
              <PromptRotator prompts={PROMPTS} />
            </span>
            <span className="sr-only">
              Open TokenZameen AI and describe what you are looking for. For example:{" "}
              {PROMPTS[0]}
            </span>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-400 text-carbon-950 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:scale-105 sm:size-14">
              <ArrowUpRight className="size-5" aria-hidden />
            </span>
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
