import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { SectionHead } from "@/components/category/section-head";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/catalog";

const PROMPTS = [
  { title: "Where", body: "The cities or micro-markets you would genuinely consider, and how often you would be there." },
  { title: "How you would use it", body: "A retreat for a few weeks a year, a second home, the address you eventually move to, or something you hold." },
  { title: "When", body: "Whether you are ready this season or watching the next two years." },
];

export function CategoryInterest({ category, index }: { category: Category; index: string }) {
  const quiet = category.slug === "spiritual-residences";

  return (
    <Section id="collection" tone="bone" space="xl" aria-labelledby="interest-heading">
      <Container width="wide">
        <AccentScope accent={category.accent} tone="light">
          <div className="mx-auto max-w-3xl text-center">
            <SectionHead
              index={index}
              id="interest-heading"
              eyebrow="Register your interest"
              title={quiet ? "The collection is being assembled." : "Nothing published here yet."}
              align="center"
              quiet={quiet}
            />

            <Reveal mode="fade" delay={0.15} duration={quiet ? 1.1 : 0.7}>
              <div className={cn("mt-8 space-y-5 text-pretty text-[color:var(--text-secondary)]", quiet && "leading-loose")}>
                {quiet ? (
                  <>
                    <p>
                      There are no Spiritual Residences on TokenZameen today, and we would rather say so
                      plainly than list whatever happens to sit near a place of significance. A project
                      joins this collection on the same terms as every other one: title, approvals,
                      developer, documentation — checked, not assumed.
                    </p>
                    <p>
                      What would help in the meantime is your brief. It is what we search against when we
                      go looking, and it is the reason a collection like this gets built at all.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      No {category.name} projects are published on TokenZameen today. We would rather
                      show an empty collection than pad one, so this page will stay honest until
                      something clears our checks.
                    </p>
                    <p>
                      Tell us the brief and an advisor will come back to you when the collection opens —
                      or sooner, if something in another collection answers it.
                    </p>
                  </>
                )}
              </div>
            </Reveal>
          </div>

          <RevealGroup
            stagger={quiet ? 0.16 : 0.08}
            delay={0.2}
            className="mx-auto mt-14 grid max-w-5xl gap-5 sm:mt-16 sm:grid-cols-3"
          >
            {PROMPTS.map((prompt, position) => (
              <RevealItem
                key={prompt.title}
                mode="fade"
                className="rounded-card bg-[color:var(--surface)] p-6 sm:p-7"
              >
                <IndexLabel index={String(position + 1).padStart(2, "0")}>Tell us</IndexLabel>
                <h3 className="mt-4 font-display text-lg font-normal text-[color:var(--text-primary)]">
                  {prompt.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  {prompt.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal mode="fade" delay={0.3} duration={quiet ? 1.1 : 0.7} className="mt-12 text-center">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                href={quiet ? "/advisory?intent=live-differently" : "/advisory"}
                variant="solid"
                size="lg"
                className="w-full sm:w-auto"
              >
                Tell us what you are looking for
              </Button>
              <Button
                href={quiet ? "/discover/live-differently" : "/purchase/properties"}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                {quiet ? "Explore sustainable and spiritual" : "Browse every collection"}
              </Button>
            </div>
            <p className="mx-auto mt-6 max-w-lg text-xs leading-relaxed text-[color:var(--text-muted)]">
              Nothing in this collection is available to book today. What you send is a brief for an
              advisor, not an enquiry against a specific property.
            </p>
          </Reveal>
        </AccentScope>
      </Container>
    </Section>
  );
}
