import type { Metadata } from "next";
import Link from "next/link";
import { Download, LayoutGrid, List, Search } from "lucide-react";
import { listAdvisors, listLeads } from "@/db/repositories";
import { LEAD_SOURCES, LEAD_STAGES, LEAD_STATUSES, type Lead } from "@/db/schema";
import { Card, Notice } from "@/components/admin/card";
import { FilterPills, Pill, withParam, type PillOption } from "@/components/admin/filter-pills";
import { firstParam, pageParam, pickParam, pickParams } from "@/components/admin/format";
import { LeadCards, LeadTable } from "@/components/admin/lead-views";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { requireAdmin } from "@/components/admin/require-admin";
import { DataError, EmptyRows, NoDatabase } from "@/components/admin/states";
import { buttonStyles } from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { env } from "@/lib/env";
import { LEAD_SOURCE_LABEL, LEAD_STAGE_LABEL, LEAD_STATUS_LABEL } from "@/lib/leads";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 25;
const SORT_VALUES = ["newest", "score", "follow-up", "name"] as const;
type LeadSort = (typeof SORT_VALUES)[number];
const SORT_OPTIONS: PillOption[] = [
  { value: "score", label: "Highest score" },
  { value: "follow-up", label: "Next follow-up" },
  { value: "name", label: "Name A–Z" },
];
const VIEW_VALUES = ["list", "grid"] as const;

const STATUS_OPTIONS: PillOption[] = LEAD_STATUSES.map((value) => ({ value, label: LEAD_STATUS_LABEL[value] }));
const STAGE_OPTIONS: PillOption[] = LEAD_STAGES.map((value) => ({ value, label: LEAD_STAGE_LABEL[value] }));
const SOURCE_OPTIONS: PillOption[] = LEAD_SOURCES.map((value) => ({ value, label: LEAD_SOURCE_LABEL[value] }));

function sortLeads(items: Lead[], sort: LeadSort): Lead[] {
  const copy = [...items];
  switch (sort) {
    case "score":
      return copy.sort((a, b) => b.score - a.score);
    case "follow-up":
      return copy.sort((a, b) => {
        const left = a.nextFollowUpAt?.getTime() ?? Number.POSITIVE_INFINITY;
        const right = b.nextFollowUpAt?.getTime() ?? Number.POSITIVE_INFINITY;
        return left - right;
      });
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy;
  }
}

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  await requireAdmin();
  const params = await searchParams;

  const status = pickParams(params.status, LEAD_STATUSES);
  const stage = pickParams(params.stage, LEAD_STAGES);
  const source = pickParams(params.source, LEAD_SOURCES);
  const sort = pickParam(params.sort, SORT_VALUES) ?? "newest";
  const view = pickParam(params.view, VIEW_VALUES) ?? "list";
  const query = (firstParam(params.q) ?? "").trim().slice(0, 80);
  const page = pageParam(params.page);
  const filtered = query.length > 0 || status.length > 0 || stage.length > 0 || source.length > 0;

  const base = new URLSearchParams();
  if (status.length > 0) base.set("status", status.join(","));
  if (stage.length > 0) base.set("stage", stage.join(","));
  if (source.length > 0) base.set("source", source.join(","));
  if (query) base.set("q", query);
  if (sort !== "newest") base.set("sort", sort);
  if (view !== "list") base.set("view", view);
  if (page > 1) base.set("page", String(page));

  const header = (
    <PageHeader
      index="02"
      eyebrow="Leads"
      title="Every enquiry, from every CTA."
      lead="Filter by status, stage and source, search by name, phone, email or reference, and open a lead to change its status, assign an advisor or add a note."
      actions={
        <>
          <div role="group" aria-label="View" className="inline-flex rounded-full border border-[color:var(--hairline)] bg-bone-100 p-1">
            {VIEW_VALUES.map((value) => {
              const active = view === value;
              const Icon = value === "list" ? List : LayoutGrid;
              return (
                <Link
                  key={value}
                  href={withParam(base, "view", value === "list" ? null : value)}
                  aria-current={active ? "true" : undefined}
                  aria-label={value === "list" ? "List view" : "Grid view"}
                  className={cn(
                    "grid size-8 place-items-center rounded-full transition-colors",
                    active ? "bg-carbon-900 text-bone-100" : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                </Link>
              );
            })}
          </div>
          <a
            href="/api/admin/leads/export"
            download
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <Download aria-hidden className="size-4" />
            Export CSV
          </a>
        </>
      }
    />
  );

  if (!env.hasDatabase) {
    return (
      <>
        {header}
        <NoDatabase section="Leads" />
      </>
    );
  }

  const [leadsResult, advisorsResult] = await Promise.all([
    listLeads({
      status: status.length > 0 ? status : undefined,
      stage: stage.length > 0 ? stage : undefined,
      source: source.length > 0 ? source : undefined,
      search: query || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    listAdvisors(),
  ]);

  const advisorNames = new Map<string, string>(
    advisorsResult.ok ? advisorsResult.data.map((advisor) => [advisor.id, advisor.name]) : [],
  );

  return (
    <>
      {header}

      <Card as="section" aria-label="Filters" className="mt-8 flex flex-col gap-6 p-6">
        <form method="get" action="/admin/leads" role="search" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {status.length > 0 ? <input type="hidden" name="status" value={status.join(",")} /> : null}
          {stage.length > 0 ? <input type="hidden" name="stage" value={stage.join(",")} /> : null}
          {source.length > 0 ? <input type="hidden" name="source" value={source.join(",")} /> : null}
          {sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}
          {view !== "list" ? <input type="hidden" name="view" value={view} /> : null}
          <label htmlFor="lead-search" className="sr-only">
            Search leads
          </label>
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <TextInput
              id="lead-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Name, phone, email or reference"
              maxLength={80}
              className="pl-11"
            />
          </div>
          <button type="submit" className={buttonStyles({ variant: "solid", size: "md" })}>
            Search
          </button>
          {query ? (
            <Link href={withParam(base, "q", null)} className={buttonStyles({ variant: "ghost", size: "md" })}>
              Clear
            </Link>
          ) : null}
        </form>

        <FilterPills label="Status" param="status" options={STATUS_OPTIONS} current={status} base={base} />
        <FilterPills label="Stage" param="stage" options={STAGE_OPTIONS} current={stage} base={base} />
        <FilterPills label="Source" param="source" options={SOURCE_OPTIONS} current={source} base={base} />

        <div className="flex flex-col gap-2">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
            Sort by
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <Pill href={withParam(base, "sort", null)} active={sort === "newest"}>
              Newest
            </Pill>
            {SORT_OPTIONS.map((option) => (
              <Pill key={option.value} href={withParam(base, "sort", option.value)} active={sort === option.value}>
                {option.label}
              </Pill>
            ))}
          </div>
        </div>
      </Card>

      {leadsResult.ok ? (
        <section aria-label="Lead results" className="mt-6 flex flex-col gap-4">
          {sort !== "newest" && leadsResult.data.total > leadsResult.data.pageSize ? (
            <Notice>
              The database returns leads newest first; this sort is applied to the {leadsResult.data.items.length} rows
              on this page, not across all {leadsResult.data.total.toLocaleString("en-IN")}.
            </Notice>
          ) : null}
          {leadsResult.data.items.length === 0 ? (
            <Card>
              <EmptyRows
                title={filtered ? "No leads match these filters" : "No leads yet"}
                body={
                  filtered
                    ? "Clear a filter or widen the search. Nothing is hidden."
                    : "The first enquiry from any CTA on the site will appear here."
                }
              />
            </Card>
          ) : view === "grid" ? (
            <LeadCards leads={sortLeads(leadsResult.data.items, sort)} advisorNames={advisorNames} />
          ) : (
            <LeadTable leads={sortLeads(leadsResult.data.items, sort)} advisorNames={advisorNames} />
          )}
          <Pagination
            page={leadsResult.data.page}
            pageSize={leadsResult.data.pageSize}
            total={leadsResult.data.total}
            base={base}
            noun="leads"
          />
        </section>
      ) : (
        <DataError message={leadsResult.error.message} context="leads" />
      )}
    </>
  );
}
