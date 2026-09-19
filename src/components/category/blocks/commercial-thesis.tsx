import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AccentScope } from "@/components/category/accent-scope";
import { SectionHead } from "@/components/category/section-head";
import { DISCLAIMERS } from "@/content/config";
import type { Accent } from "@/components/category/accent";

const THESIS = [
  {
    title: "Lease structure",
    body: "Tenure, lock-in, notice, escalation and who carries maintenance, tax and repair. A headline rent means very little until the clause that governs it has been read.",
    evidence: "Read against the lease deed and any amendments",
  },
  {
    title: "Tenant quality",
    body: "Who actually pays the rent, how long they have traded, and what happens to the unit if they leave. Covenant strength is the difference between an income and a hope.",
    evidence: "Read against the tenant's agreement and rent receipts",
  },
  {
    title: "Catchment",
    body: "The working population, residential depth and footfall the address genuinely draws on — and how much of that is already trading rather than under construction.",
    evidence: "Read against the site, the approved plan and what is open today",
  },
  {
    title: "Yield",
    body: "Gross against net, and everything that erodes the distance between them: vacancy, common-area charges, taxes, brokerage, refurbishment between tenants.",
    evidence: "Derived only from a rent that a document establishes",
  },
  {
    title: "Exit and liquidity",
    body: "Who the next buyer is for a unit of this size and ticket, what comparable assets have taken to transact, and whether the lease helps or hinders that sale.",
    evidence: "Discussed with the advisor, never asserted as a projection",
  },
];

export function CommercialThesis({ accent, index }: { accent: Accent; index: string }) {
  return (
    <Section tone="darker" space="xl" aria-labelledby="thesis-heading">
      <Container width="wide">
        <AccentScope accent={accent} tone="dark">
          <SectionHead
            index={index}
            id="thesis-heading"
            eyebrow="The income thesis"
            title="Commercial is underwritten, not admired."
            lede="Residential collections are read on how a home lives. A commercial asset is read on whether the income survives contact with the documentation. Five things decide that, and we work through them in this order."
          />

          <RevealGroup className="mt-14 grid gap-x-10 gap-y-12 border-t border-[color:var(--hairline)] pt-10 sm:mt-20 md:grid-cols-2 xl:grid-cols-3">
            {THESIS.map((item, position) => (
              <RevealItem key={item.title}>
                <IndexLabel index={String(position + 1).padStart(2, "0")}>Thesis</IndexLabel>
                <h3 className="mt-4 text-display-sm text-[color:var(--text-primary)]">{item.title}</h3>
                <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]">
                  {item.body}
                </p>
                <p className="eyebrow mt-5 text-[color:var(--text-muted)]">{item.evidence}</p>
              </RevealItem>
            ))}

            <RevealItem className="rounded-card bg-[color:var(--surface-raised)] p-7 sm:p-8">
              <h3 className="text-display-sm text-balance text-[color:var(--text-primary)]">
                Every figure on a commercial page is labelled with where it came from.
              </h3>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                <p>
                  Rent, lease tenure, escalation, tenant and yield are reproduced from the lease and
                  the rent roll, not from a sales deck. Where a document has not reached us, the field
                  reads &ldquo;on request&rdquo; and the project page lists it as information being
                  compiled.
                </p>
                <p>
                  You are entitled to ask for the source of any number you see here before you commit
                  to anything. Ask. An advisor will send it.
                </p>
              </div>
            </RevealItem>
          </RevealGroup>

          <p className="mt-14 max-w-3xl border-t border-[color:var(--hairline)] pt-6 text-xs leading-relaxed text-[color:var(--text-muted)]">
            {DISCLAIMERS.financial}
          </p>
        </AccentScope>
      </Container>
    </Section>
  );
}
