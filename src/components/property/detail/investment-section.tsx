import Image from "next/image";
import { Disclaimer, Panel, PendingPanel } from "@/components/property/detail/detail-primitives";
import { MoneyCountUp, PercentCountUp } from "@/components/property/detail/count-up-money";
import { IntelligenceBlock } from "@/components/property/detail/intelligence-block";
import { RequestButton } from "@/components/property/detail/request-context";
import { hasCommercialTerms } from "@/components/property/detail/sections";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
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

/**
 * The page's carbon inversion: Property Intelligence, the Investment Snapshot and
 * the payment plan share one band, after board 04's glass cards over imagery.
 */
export function InvestmentSection({ project, index }: { project: Project; index: string }) {
  const terms = project.commercial;
  const snapshot = terms && hasCommercialTerms(project) ? tilesFor(terms) : [];

  return (
    <Section
      id="intelligence"
      tone="darker"
      space="xl"
      aria-label={`${project.name} investment view`}
      className="isolate scroll-mt-[9.5rem] overflow-hidden"
    >
      <Image
        src={project.hero.src}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-20"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-carbon-950 via-carbon-950/70 to-carbon-950"
      />

      <Container width="wide">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <IndexLabel index={index}>Investment view</IndexLabel>
              <h2 className="mt-6 max-w-[14ch] text-display-xl text-[color:var(--text-primary)]">
                How we read this property.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--text-secondary)] lg:pb-3 lg:text-right">
              Everything on this band is either published by the project, or marked as the
              TokenZameen team’s own read. Nothing here is a guarantee of return.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col gap-20 lg:mt-20">
          <IntelligenceBlock project={project} />

          {snapshot.length > 0 && terms ? (
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <h3 className="text-display-md text-[color:var(--text-primary)]">Investment snapshot</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-secondary)] sm:text-base">
                    The terms, as published. Project-specific and indicative — every figure is
                    confirmed against the lease and the transaction documents before anything is
                    committed.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {terms.preLeased ? <Badge tone="outline">Pre-leased</Badge> : null}
                  <Badge tone="outline">Indicative</Badge>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {snapshot.map((tile, position) => (
                  <Reveal
                    as="div"
                    key={tile.label}
                    delay={position * 0.06}
                    className="glass flex min-h-[10rem] flex-col justify-between gap-6 rounded-card p-5 sm:p-6"
                  >
                    <dt className="eyebrow text-[color:var(--text-muted)]">{tile.label}</dt>
                    <dd className="tabular font-display text-display-md leading-none tracking-tight text-[color:var(--text-primary)]">
                      {tile.node}
                    </dd>
                  </Reveal>
                ))}
              </dl>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Disclaimer label="Financial figures">{DISCLAIMERS.financial}</Disclaimer>
                <Panel tone="glass" className="flex items-center gap-4 p-5 sm:p-5">
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

          <div className="flex flex-col gap-8">
            <div className="max-w-2xl">
              <h3 className="text-display-md text-[color:var(--text-primary)]">Payment plan</h3>
            </div>
            {terms?.paymentStructure ? (
              <Panel tone="glass" className="max-w-3xl">
                <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  {terms.paymentStructure}
                </p>
              </Panel>
            ) : (
              <PendingPanel
                className="max-w-3xl"
                title="Payment structure not yet released"
                body="The developer has not released a payment schedule we can publish. An advisor will send the current structure in writing, along with what each milestone depends on."
                action={
                  <RequestButton subject="the payment structure" source="request-price" variant="solid">
                    Request the payment structure
                  </RequestButton>
                }
              />
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
