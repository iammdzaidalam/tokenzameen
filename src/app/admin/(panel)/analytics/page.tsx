import type { Metadata } from "next";
import Link from "next/link";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/db/repositories";
import { ANALYTICS_EVENT_TYPES, type AnalyticsEventType } from "@/db/schema";
import { Card, CardHeader, DefinitionList, Notice } from "@/components/admin/card";
import { formatRate } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/components/admin/require-admin";
import { DataError, EmptyRows, NoDatabase } from "@/components/admin/states";
import { Table, Td, Th, Tr } from "@/components/admin/table";
import { StatGrid, type Stat } from "@/components/ui/stat-grid";
import { getProject } from "@/lib/catalog";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Analytics" };

const DAY_MS = 86_400_000;

const EVENT_LABEL: Record<AnalyticsEventType, string> = {
  "page-view": "Page views",
  "property-view": "Property views",
  "category-view": "Category views",
  search: "Searches",
  "filter-use": "Filter uses",
  save: "Saves",
  compare: "Comparisons",
  "brochure-download": "Brochure downloads",
  enquiry: "Enquiries",
  call: "Calls",
  whatsapp: "WhatsApp clicks",
  "site-visit-request": "Site visit requests",
  "purchase-request": "Purchase requests",
};

function countOf(summary: AnalyticsSummary, type: AnalyticsEventType): number {
  return summary.events.find((row) => row.type === type)?.count ?? 0;
}

function Bar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <div aria-hidden className="h-1.5 w-full min-w-[6rem] overflow-hidden rounded-full bg-bone-200">
      <div className="h-full rounded-full bg-carbon-900" style={{ width: `${width.toFixed(1)}%` }} />
    </div>
  );
}

export default async function AnalyticsPage() {
  await requireAdmin();

  const header = (
    <PageHeader
      index="07"
      eyebrow="Analytics"
      title="Events the site recorded."
      lead="Counts from analytics_events over the last 7 and 30 days, and the conversion ratios PRD 01 §41 asks for. Bars are proportional to the largest count in the table; nothing is charted from a model."
    />
  );

  if (!env.hasDatabase) {
    return (
      <>
        {header}
        <NoDatabase section="Analytics" />
      </>
    );
  }

  const now = new Date();
  const [week, month] = await Promise.all([
    getAnalyticsSummary({ from: new Date(now.getTime() - 7 * DAY_MS), to: now }),
    getAnalyticsSummary({ from: new Date(now.getTime() - 30 * DAY_MS), to: now }),
  ]);

  if (!month.ok) {
    return (
      <>
        {header}
        <DataError message={month.error.message} context="the 30-day summary" />
      </>
    );
  }

  const rows = ANALYTICS_EVENT_TYPES.map((type) => ({
    type,
    label: EVENT_LABEL[type],
    week: week.ok ? countOf(week.data, type) : null,
    month: countOf(month.data, type),
  }));
  const maxMonth = Math.max(0, ...rows.map((row) => row.month));

  const totals: Stat[] = [
    { value: month.data.totals.events, label: "Events recorded", note: "Last 30 days" },
    { value: month.data.totals.leads, label: "Leads created", note: "Last 30 days" },
    { value: month.data.totals.siteVisits, label: "Site visits requested", note: "Last 30 days" },
    { value: month.data.totals.purchased, label: "Leads marked purchased", note: "Last 30 days" },
  ];

  return (
    <>
      {header}

      <section aria-label="Totals" className="mt-8">
        <StatGrid stats={totals} invertIndex={0} columns={4} />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card as="section" aria-label="Events by type">
          <CardHeader
            title="Events by type"
            note={week.ok ? "Zero means nothing was recorded, not that the count is unknown." : "The 7-day column could not be read."}
          />
          <Table caption="Events by type" className="rounded-none border-0" minWidth="min-w-[36rem]">
            <thead>
              <tr>
                <Th>Event</Th>
                <Th align="right">7 days</Th>
                <Th align="right">30 days</Th>
                <Th>Share of largest</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.type}>
                  <Td>{row.label}</Td>
                  <Td align="right" className="tabular">
                    {row.week === null ? "—" : row.week.toLocaleString("en-IN")}
                  </Td>
                  <Td align="right" className="tabular font-medium">
                    {row.month.toLocaleString("en-IN")}
                  </Td>
                  <Td>
                    <Bar value={row.month} max={maxMonth} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="flex flex-col gap-8">
          <Card as="section" aria-label="Conversion rates">
            <CardHeader title="Conversion, 30 days" note="Null denominators show as a dash." />
            <div className="px-6">
              <DefinitionList
                items={[
                  {
                    term: "Page view → lead",
                    value: `${formatRate(month.data.rates.enquiryConversion)} · ${month.data.totals.leads} leads over ${countOf(month.data, "page-view")} page views`,
                  },
                  {
                    term: "Lead → site visit",
                    value: `${formatRate(month.data.rates.leadToSiteVisit)} · ${month.data.totals.siteVisits} of ${month.data.totals.leads}`,
                  },
                  {
                    term: "Site visit → purchase",
                    value: `${formatRate(month.data.rates.siteVisitToPurchase)} · ${month.data.totals.purchased} of ${month.data.totals.siteVisits}`,
                  },
                ]}
              />
            </div>
          </Card>

          <Card as="section" aria-label="Property views by project">
            <CardHeader title="Property views, 30 days" note="Top ten project slugs by property-view events." />
            {month.data.topProjects.length === 0 ? (
              <EmptyRows title="No property views recorded" body="Views are counted once the analytics endpoint has rows to store." />
            ) : (
              <ul className="divide-y divide-[color:var(--hairline)]">
                {month.data.topProjects.map((row) => {
                  const project = getProject(row.projectSlug);
                  return (
                    <li key={row.projectSlug} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                      {project ? (
                        <Link href={`/purchase/${project.slug}`} className="underline-offset-4 hover:underline">
                          {project.name}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs">{row.projectSlug}</span>
                      )}
                      <span className="tabular font-display text-lg">{row.views.toLocaleString("en-IN")}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Notice className="mt-8">
        Search terms and filter usage are counted above as the <em>Searches</em> and <em>Filter uses</em> rows.
        The per-term and per-filter breakdown lives in each event&apos;s payload, which no repository function
        reads yet; it will appear here once <code className="font-mono">src/db/repositories.ts</code> exposes
        one, rather than being reconstructed in the panel.
      </Notice>
    </>
  );
}
