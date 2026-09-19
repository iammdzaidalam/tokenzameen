import { Activity, Compass, Gauge, Layers, TrendingUp, Users } from "lucide-react";
import { Disclaimer, Panel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { RequestButton } from "@/components/property/detail/request-context";
import { ACCENT_BY_CATEGORY } from "@/components/property/detail/sections";
import { ScoreBar } from "@/components/ui/score-bar";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { DISCLAIMERS } from "@/content/config";
import { formatDate } from "@/lib/format";
import type { Project, PropertyIntelligence } from "@/types/catalog";

interface Factor {
  key: keyof Pick<
    PropertyIntelligence,
    | "locationAdvantage"
    | "demand"
    | "rentalPotential"
    | "infrastructure"
    | "liquidity"
    | "capitalAppreciation"
  >;
  label: string;
  meaning: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FACTORS: Factor[] = [
  {
    key: "locationAdvantage",
    label: "Location advantage",
    meaning:
      "What the address itself is worth: access, the quality of what is already built around it, and whether the surroundings are improving or drifting.",
    icon: Compass,
  },
  {
    key: "demand",
    label: "Demand",
    meaning:
      "How consistently buyers and tenants look for this kind of property in this micro-market, rather than in the city as a whole.",
    icon: Users,
  },
  {
    key: "rentalPotential",
    label: "Rental potential",
    meaning:
      "How readily the asset lets, on what kind of terms, and how stable that income tends to be through a cycle.",
    icon: TrendingUp,
  },
  {
    key: "infrastructure",
    label: "Infrastructure",
    meaning:
      "Roads, transport, utilities and civic projects that are already built, funded or genuinely under way — not announced.",
    icon: Layers,
  },
  {
    key: "liquidity",
    label: "Liquidity",
    meaning:
      "How straightforward an exit is: the depth of the resale market and how long a sale typically takes at a fair price.",
    icon: Gauge,
  },
  {
    key: "capitalAppreciation",
    label: "Capital appreciation",
    meaning:
      "The case for value over the stated horizon, and — just as important — what that case depends on.",
    icon: Activity,
  },
];

export function IntelligenceSection({ project }: { project: Project }) {
  const accent = ACCENT_BY_CATEGORY[project.primaryCategory];
  const intelligence = project.intelligence;

  return (
    <Section
      id="intelligence"
      tone="darker"
      aria-label={`${project.name} property intelligence`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <SectionHeading
          eyebrow="TokenZameen Property Intelligence"
          title="How we read this property"
          lead="Six factors, weighed by the TokenZameen team and written down. It is a considered opinion on what tends to drive an asset like this one — never a rating, a valuation or a promise."
        />

        {intelligence ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <div className="flex flex-col gap-7">
              {FACTORS.map((factor, index) => (
                <ScoreBar
                  key={factor.key}
                  label={factor.label}
                  value={intelligence[factor.key]}
                  accent={accent}
                  delay={index * 0.05}
                />
              ))}
            </div>

            <div className="flex flex-col gap-6">
              <Panel className="flex flex-col gap-5">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <p className="eyebrow text-[color:var(--text-muted)]">Investment horizon</p>
                    <p className="mt-2 font-display text-display-sm text-[color:var(--text-primary)]">
                      {intelligence.horizon}
                    </p>
                  </div>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    Assessed {formatDate(intelligence.assessedOn)}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  {intelligence.summary}
                </p>
              </Panel>

              <Disclaimer label="Property Intelligence">{DISCLAIMERS.intelligence}</Disclaimer>
            </div>
          </div>
        ) : (
          <div className="mt-12 flex flex-col gap-8">
            <Panel className="flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-xl">
                <p className="eyebrow text-[color:var(--accent)]">Assessment in progress</p>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  The TokenZameen team has not completed its assessment of {project.name}. Until it
                  is signed off, this page shows no scores — we will not generate them from the other
                  numbers on the page, and no one should read an absence as a low mark.
                </p>
              </div>
              <RequestButton
                subject="the Property Intelligence assessment when it is published"
                source="investment-enquiry"
                variant="primary"
              >
                Send it to me when it lands
              </RequestButton>
            </Panel>

            <ul className="grid gap-px overflow-hidden rounded-panel border border-[color:var(--hairline)] bg-[color:var(--hairline)] sm:grid-cols-2 lg:grid-cols-3">
              {FACTORS.map((factor) => {
                const Icon = factor.icon;
                return (
                  <li key={factor.key} className="flex flex-col gap-4 bg-[color:var(--surface)] p-6">
                    <Icon aria-hidden className="size-5 text-[color:var(--accent)]" />
                    <div>
                      <h3 className="font-subhead text-[0.9375rem] font-medium text-[color:var(--text-primary)]">
                        {factor.label}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                        {factor.meaning}
                      </p>
                    </div>
                    <p className="mt-auto text-xs text-[color:var(--text-muted)]">Awaiting assessment</p>
                  </li>
                );
              })}
            </ul>

            <Disclaimer label="Property Intelligence">{DISCLAIMERS.intelligence}</Disclaimer>
          </div>
        )}
      </Container>
    </Section>
  );
}
