import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { accentText } from "@/components/category/accent";
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
  quiet = false,
}: {
  accent?: Accent;
  href?: string;
  quiet?: boolean;
}) {
  return (
    <Section tone="light" space="lg" aria-labelledby="advisory-heading">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:gap-20">
          <Reveal duration={quiet ? 1 : 0.7}>
            <Eyebrow withRule className={accentText(accent, "light")}>
              Advisory
            </Eyebrow>
            <h2
              id="advisory-heading"
              className={cn("mt-5 text-balance text-display-lg", quiet && "font-normal")}
            >
              Not sure where to start?
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
              Tell us your requirements. Our property advisors will help you navigate the TokenZameen
              collection.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button href={href} variant="solid" size="lg">
                Talk to an Advisor
              </Button>
              <p className="text-xs text-[color:var(--text-muted)]">
                As much or as little as you have. An advisor works with whatever you can give them.
              </p>
            </div>
          </Reveal>

          <div>
            <p className="eyebrow text-[color:var(--text-muted)]">What to have ready</p>
            <RevealGroup as="ul" className="mt-6 border-t border-[color:var(--hairline)]">
              {FIELDS.map((field) => (
                <RevealItem
                  as="li"
                  key={field.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[color:var(--hairline)] py-4"
                >
                  <span className="font-display text-lg text-[color:var(--text-primary)]">
                    {field.label}
                  </span>
                  <span className="text-sm text-[color:var(--text-secondary)]">{field.hint}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </Container>
    </Section>
  );
}
