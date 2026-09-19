import { Disclaimer, PendingPanel, Panel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { MoneyCountUp, PercentCountUp } from "@/components/property/detail/count-up-money";
import { RequestButton } from "@/components/property/detail/request-context";
import { hasCommercialTerms } from "@/components/property/detail/sections";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { DISCLAIMERS } from "@/content/config";
import type { CommercialTerms, Project } from "@/types/catalog";

interface SnapshotTile {
  label: string;
  node: React.ReactNode;
}

function tilesFor(terms: CommercialTerms): SnapshotTile[] {
  const tiles: SnapshotTile[] = [];

  if (terms.propertyValue) {
    tiles.push({ label: "Property value", node: <MoneyCountUp amount={terms.propertyValue.amount} /> });
  }
  if (terms.initialInvestment) {
    tiles.push({
      label: "Initial investment",
      node: <MoneyCountUp amount={terms.initialInvestment.amount} />,
    });
  }
  if (terms.monthlyRent) {
    tiles.push({ label: "Monthly rent", node: <MoneyCountUp amount={terms.monthlyRent.amount} /> });
  }
  if (terms.annualRent) {
    tiles.push({ label: "Annual rent", node: <MoneyCountUp amount={terms.annualRent.amount} /> });
  }
  if (terms.ownership) {
    tiles.push({ label: "Ownership", node: terms.ownership });
  }
  if (terms.leaseTenure) {
    tiles.push({ label: "Lease", node: terms.leaseTenure });
  }
  if (terms.grossYieldPercent !== null) {
    tiles.push({
      label: "Indicative gross yield",
      node: <PercentCountUp value={terms.grossYieldPercent} />,
    });
  }

  return tiles;
}

export function InvestmentSection({ project }: { project: Project }) {
  const terms = project.commercial;
  const snapshot = terms && hasCommercialTerms(project) ? tilesFor(terms) : [];

  return (
    <Section tone="dark" aria-label={`${project.name} investment terms`}>
      <Container width="wide">
        {snapshot.length > 0 && terms ? (
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Investment snapshot"
                title="The terms, as published"
                lead="Project-specific and indicative. Every figure here is confirmed against the lease and the transaction documents before anything is committed."
              />
              <div className="flex flex-wrap gap-2">
                {terms.preLeased ? <Badge tone="gold">Pre-leased</Badge> : null}
                <Badge tone="outline">Indicative</Badge>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-[color:var(--hairline)] bg-[color:var(--hairline)] lg:grid-cols-4">
              {snapshot.map((tile) => (
                <div key={tile.label} className="flex flex-col gap-3 bg-[color:var(--surface)] p-6">
                  <dt className="eyebrow text-[color:var(--text-muted)]">{tile.label}</dt>
                  <dd className="tabular font-display text-display-sm leading-none text-[color:var(--accent)]">
                    {tile.node}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Disclaimer label="Financial figures">{DISCLAIMERS.financial}</Disclaimer>
              <Panel className="flex items-center justify-between gap-4 p-5 sm:p-5">
                <div>
                  <p className="eyebrow text-[color:var(--text-muted)]">Tenant</p>
                  <p className="mt-1.5 text-sm text-[color:var(--text-primary)]">
                    {terms.tenant ?? "Shared on request, where legally permitted"}
                  </p>
                </div>
              </Panel>
            </div>
          </div>
        ) : null}

        <div className={snapshot.length > 0 ? "mt-16" : ""}>
          <SectionHeading eyebrow="Payment plan" title="How the payment is structured" size="md" />

          {terms?.paymentStructure ? (
            <Panel className="mt-8 max-w-3xl">
              <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
                {terms.paymentStructure}
              </p>
            </Panel>
          ) : (
            <PendingPanel
              className="mt-8 max-w-3xl"
              title="Payment structure not yet released"
              body="The developer has not released a payment schedule we can publish. An advisor will send the current structure in writing, along with what each milestone depends on."
              action={
                <RequestButton subject="the payment structure" source="request-price" variant="primary">
                  Request the payment structure
                </RequestButton>
              }
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
