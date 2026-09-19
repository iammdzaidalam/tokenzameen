import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { cn } from "@/lib/cn";
import type { Accent } from "@/components/category/accent";

const FIELDS = [
  { label: "Budget", hint: "A range is enough" },
  { label: "Location", hint: "City, or the area you know" },
  { label: "Property Type", hint: "Or the collections you are torn between" },
  { label: "Purpose", hint: "To live in, to let, to hold" },
  { label: "Timeline", hint: "This season, or watching" },
];

export function AdvisoryCta({
  accent = "gold",
  href = "/advisory",
  tone = "bone",
  quiet = false,
}: {
  accent?: Accent;
  href?: string;
  tone?: "bone" | "paper";
  quiet?: boolean;
}) {
  return (
    <Section tone={tone} space="lg" aria-labelledby="advisory-heading">
      <Container width="wide">
        <AccentScope accent={accent} tone="light">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:gap-20">
            <Reveal duration={quiet ? 1 : 0.7}>
              <IndexLabel>Advisory</IndexLabel>
              <h2
                id="advisory-heading"
                className={cn("mt-5 text-balance text-display-lg text-[color:var(--text-primary)]", quiet && "font-normal")}
              >
                Not sure where to start?
              </h2>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
                Tell us your requirements. Our property advisors will help you navigate the TokenZameen
                collection.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button href={href} variant="solid" size="lg" className="w-full sm:w-auto">
                  Talk to an Advisor
                </Button>
                <p className="text-xs text-[color:var(--text-muted)]">
                  As much or as little as you have. An advisor works with whatever you can give them.
                </p>
              </div>
            </Reveal>

            <div className={cn("rounded-card p-6 sm:p-8", tone === "bone" ? "bg-[color:var(--surface)]" : "bg-bone-100")}>
              <p className="eyebrow text-[color:var(--text-muted)]">What to have ready</p>
              <RevealGroup as="ul" className="mt-5 border-t border-[color:var(--hairline)]">
                {FIELDS.map((field, position) => (
                  <RevealItem
                    as="li"
                    key={field.label}
                    className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-b border-[color:var(--hairline)] py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto]"
                  >
                    <span className="eyebrow tabular text-[color:var(--accent)]">
                      /{String(position + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg text-[color:var(--text-primary)]">
                      {field.label}
                    </span>
                    <span className="col-start-2 text-sm text-[color:var(--text-secondary)] sm:col-start-3 sm:text-right">
                      {field.hint}
                    </span>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </div>
        </AccentScope>
      </Container>
    </Section>
  );
}
