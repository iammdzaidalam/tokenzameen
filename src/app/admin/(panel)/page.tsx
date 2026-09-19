import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAnalyticsSummary, listLeads, listSiteVisits, type Page, type Result } from "@/db/repositories";
import { LEAD_SOURCES, type Lead, type LeadSource } from "@/db/schema";
import { Card, CardHeader } from "@/components/admin/card";
import { LeadStatusChip, SourceChip, StageChip } from "@/components/admin/chips";
import { formatDateTime, formatRate } from "@/components/admin/format";
import { MetricCard } from "@/components/admin/metric-card";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/components/admin/require-admin";
import { DataError, EmptyRows, NoDatabase } from "@/components/admin/states";
import { StatGrid, type Stat } from "@/components/ui/stat-grid";
import { getProject } from "@/lib/catalog";
import { env } from "@/lib/env";
import { LEAD_SOURCE_LABEL } from "@/lib/leads";

export const metadata: Metadata = { title: "Dashboard" };

const DAY_MS = 86_400_000;

function totalOf<T>(result: Result<Page<T>>): number | null {
  return result.ok ? result.data.total : null;
}

function LeadRailCard({ lead }: { lead: Lead }) {
  const project = lead.projectSlug ? getProject(lead.projectSlug) : null;
  return (
    <li>
      <Link
        href={`/admin/leads/${lead.id}`}
        className="group flex flex-col gap-3 rounded-xl border border-[color:var(--hairline)] bg-bone-50 p-4 transition-colors hover:border-[color:var(--hairline-strong)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{lead.name}</p>
            <p className="tabular mt-0.5 font-mono text-xs text-[color:var(--text-muted)]">{lead.reference}</p>
          </div>
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[color:var(--hairline)] text-[color:var(--text-primary)] transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:rotate-45">
            <ArrowUpRight aria-hidden className="size-3.5" />
          </span>
        </div>
        <p className="text-xs text-[color:var(--text-secondary)]">
          {project ? project.name : lead.projectSlug ? lead.projectSlug : "No property named"}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <SourceChip source={lead.source} />
          <StageChip stage={lead.stage} />
          <LeadStatusChip status={lead.status} />
        </div>
        <p className="text-[0.6875rem] text-[color:var(--text-muted)]">{formatDateTime(lead.createdAt)}</p>
      </Link>
    </li>
  );
}

export default async function DashboardPage() {
  await requireAdmin();

  const header = (
    <PageHeader
      index="01"
      eyebrow="Dashboard"
      title="What the team has recorded."
      lead="Every figure on this page is a count of rows in the database. Nothing is projected, estimated or sampled."
    />
  );

  if (!env.hasDatabase) {
    return (
      <>
        {header}
        <NoDatabase section="The dashboard" />
      </>
    );
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const monthAgo = new Date(now.getTime() - 30 * DAY_MS);

  const [core, sourceResults] = await Promise.all([
    Promise.all([
      listLeads({ pageSize: 1 }),
      listLeads({ from: weekAgo, pageSize: 1 }),
      listLeads({ stage: ["hot", "purchase-ready"], pageSize: 1 }),
      listSiteVisits({ status: ["requested"], pageSize: 1 }),
      listSiteVisits({ pageSize: 1 }),
      listLeads({ pageSize: 6 }),
      getAnalyticsSummary({ from: monthAgo, to: now }),
    ]),
    Promise.all(LEAD_SOURCES.map((source) => listLeads({ source: [source], pageSize: 1 }))),
  ]);
  const [allLeads, weekLeads, hotLeads, requestedVisits, allVisits, latest, summary] = core;

  if (!allLeads.ok) {
    return (
      <>
        {header}
        <DataError message={allLeads.error.message} context="the lead counts" />
      </>
    );
  }

  const totalLeads = allLeads.data.total;
  const bySource: Array<{ source: LeadSource; count: number | null }> = LEAD_SOURCES.map(
    (source, index) => ({ source, count: totalOf(sourceResults[index]) }),
  );
  const maxSource = Math.max(0, ...bySource.map((row) => row.count ?? 0));

  const conversion: Stat[] | null = summary.ok
    ? [
        { value: summary.data.totals.leads, label: "Leads recorded", note: "Last 30 days" },
        {
          value: summary.data.totals.siteVisits,
          label: "Site visits requested",
          note: "Last 30 days",
        },
        {
          value: formatRate(summary.data.rates.leadToSiteVisit),
          label: "Lead → site visit",
          note:
            summary.data.rates.leadToSiteVisit === null
              ? "No leads in the window yet"
              : `${summary.data.totals.siteVisits} visits from ${summary.data.totals.leads} leads`,
        },
        {
          value: formatRate(summary.data.rates.siteVisitToPurchase),
          label: "Site visit → purchased",
          note:
            summary.data.rates.siteVisitToPurchase === null
              ? "No site visits in the window yet"
              : `${summary.data.totals.purchased} purchased from ${summary.data.totals.siteVisits} visits`,
        },
      ]
    : null;

  return (
    <>
      {header}

      <section aria-label="Key counts" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Leads this week"
          value={totalOf(weekLeads)}
          tint="sage"
          share={{ of: totalLeads, label: "of all leads ever recorded" }}
          href="/admin/leads"
        />
        <MetricCard
          label="Hot and purchase-ready"
          value={totalOf(hotLeads)}
          tint="gold"
          share={{ of: totalLeads, label: "of all leads" }}
          href="/admin/leads?stage=hot,purchase-ready"
        />
        <MetricCard
          label="Site visits awaiting confirmation"
          value={totalOf(requestedVisits)}
          tint="steel"
          share={{ of: totalOf(allVisits), label: "of all site-visit requests" }}
          href="/admin/site-visits?status=requested"
        />
        <MetricCard
          label="All leads"
          value={totalLeads}
          tint="lotus"
          note="Every enquiry from every CTA, whatever its status."
          href="/admin/leads"
        />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-8">
          <section aria-label="Conversion">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-display-sm">Conversion, last 30 days</h2>
              <p className="text-xs text-[color:var(--text-muted)]">
                Computed from recorded events by <code className="font-mono">getAnalyticsSummary</code>.
              </p>
            </div>
            {conversion ? (
              <StatGrid stats={conversion} invertIndex={2} columns={4} />
            ) : (
              <DataError
                message={summary.ok ? "" : summary.error.message}
                context="the conversion figures"
              />
            )}
          </section>

          <Card as="section" aria-label="Enquiries by source">
            <CardHeader
              title="Enquiries by source"
              note="All time. One row per lead source in PRD 01 §30; a zero is a zero."
            />
            <ul className="divide-y divide-[color:var(--hairline)]">
              {bySource.map((row) => {
                const width = row.count && maxSource > 0 ? (row.count / maxSource) * 100 : 0;
                return (
                  <li key={row.source} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <Link
                          href={`/admin/leads?source=${row.source}`}
                          className="truncate text-sm hover:text-[color:var(--accent)]"
                        >
                          {LEAD_SOURCE_LABEL[row.source]}
                        </Link>
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-bone-200">
                        <div className="h-full rounded-full bg-carbon-900" style={{ width: `${width.toFixed(1)}%` }} />
                      </div>
                    </div>
                    <span className="tabular w-12 text-right font-display text-lg">
                      {row.count === null ? "—" : row.count.toLocaleString("en-IN")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <Card as="aside" aria-label="Latest leads">
          <CardHeader
            title="Latest leads"
            note="Newest six rows."
            actions={
              <Link href="/admin/leads" className="text-xs text-[color:var(--accent)] underline-offset-4 hover:underline">
                All leads
              </Link>
            }
          />
          {latest.ok ? (
            latest.data.items.length > 0 ? (
              <ul className="flex flex-col gap-3 p-4">
                {latest.data.items.map((lead) => (
                  <LeadRailCard key={lead.id} lead={lead} />
                ))}
              </ul>
            ) : (
              <EmptyRows
                title="No leads yet"
                body="The first enquiry from any CTA on the site will appear here."
              />
            )
          ) : (
            <p className="p-6 text-sm text-signal-danger">{latest.error.message}</p>
          )}
        </Card>
      </div>
    </>
  );
}
