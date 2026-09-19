import { AdvisorChat } from "@/components/advisor/advisor-chat";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { getAllProjects } from "@/lib/catalog";

/**
 * The AI Property Advisor as a page section. A floating launcher can mount
 * `AdvisorChat` directly with `projects={getAllProjects()}` from a Server
 * Component; this wrapper supplies the heading and the catalogue.
 */
export function AdvisorSection({
  id = "ai",
  tone = "paper",
}: {
  id?: string;
  tone?: "paper" | "bone" | "dark" | "darker";
}) {
  return (
    <Section id={id} tone={tone} space="lg" aria-labelledby={`${id}-heading`} className="scroll-mt-[72px]">
      <Container width="default">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <Eyebrow withRule>TokenZameen AI</Eyebrow>
            <h2 id={`${id}-heading`} className="mt-5 text-balance text-display-lg">
              Meet your property advisor.
            </h2>
            <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-[color:var(--text-secondary)]">
              Tell us what you&rsquo;re looking for. TokenZameen AI will help you navigate the
              collection.
            </p>
            <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-[color:var(--text-muted)]">
              It reads your question the way the discovery engine does — category, location, budget,
              purpose — and answers only from what each project has published.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <AdvisorChat projects={getAllProjects()} />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
