import type { Metadata } from "next";
import Link from "next/link";
import { listSiteVisits, type SiteVisitWithLead } from "@/db/repositories";
import { SITE_VISIT_STATUSES, type SiteVisitStatus } from "@/db/schema";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card } from "@/components/admin/card";
import { LeadStatusChip, SITE_VISIT_STATUS_LABEL, StageChip, VisitStatusChip } from "@/components/admin/chips";
import { FilterPills, type PillOption } from "@/components/admin/filter-pills";
import { formatCalendarDay, formatDateTime, pageParam, pickParam } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { requireAdmin } from "@/components/admin/require-admin";
import { DataError, EmptyRows, NoDatabase } from "@/components/admin/states";
import { Table, Td, Th, Tr } from "@/components/admin/table";
import { getProject } from "@/lib/catalog";
import { env } from "@/lib/env";
import { VISIT_SLOT_LABEL, type VisitSlot } from "@/lib/validation";
import { setSiteVisitStatusAction } from "./actions";

export const metadata: Metadata = { title: "Site visits" };

const PAGE_SIZE = 25;
const STATUS_OPTIONS: PillOption[] = SITE_VISIT_STATUSES.map((value) => ({
  value,
  label: SITE_VISIT_STATUS_LABEL[value],
}));

interface Transition {
  status: SiteVisitStatus;
  label: string;
  confirm?: string;
}

const TRANSITIONS: Record<SiteVisitStatus, Transition[]> = {
  requested: [
    { status: "confirmed", label: "Confirm" },
    { status: "cancelled", label: "Cancel", confirm: "Cancel this site visit?" },
  ],
  confirmed: [
    { status: "completed", label: "Mark completed" },
    { status: "cancelled", label: "Cancel", confirm: "Cancel this site visit?" },
  ],
  completed: [],
  cancelled: [],
};

function slotLabel(value: string | null): string {
  if (!value) return "Any time";
  return value in VISIT_SLOT_LABEL ? VISIT_SLOT_LABEL[value as VisitSlot] : value;
}

function VisitActions({ row }: { row: SiteVisitWithLead }) {
  const transitions = TRANSITIONS[row.visit.status];
  if (transitions.length === 0) {
    return <span className="text-xs text-[color:var(--text-muted)]">No further action</span>;
  }
  return (
    <ActionForm action={setSiteVisitStatusAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="visitId" value={row.visit.id} />
      <input type="hidden" name="leadId" value={row.lead?.id ?? ""} />
      {transitions.map((transition) => (
        <SubmitButton
          key={transition.status}
          name="status"
          value={transition.status}
          variant={transition.status === "cancelled" ? "ghost" : "solid"}
          confirm={transition.confirm}
          pendingLabel="Saving…"
        >
          {transition.label}
        </SubmitButton>
      ))}
    </ActionForm>
  );
}

export default async function SiteVisitsPage({ searchParams }: PageProps<"/admin/site-visits">) {
  await requireAdmin();
  const params = await searchParams;
  const status = pickParam(params.status, SITE_VISIT_STATUSES);
  const page = pageParam(params.page);

  const base = new URLSearchParams();
  if (status) base.set("status", status);
  if (page > 1) base.set("page", String(page));

  const header = (
    <PageHeader
      index="03"
      eyebrow="Site visits"
      title="Requests to see a property."
      lead="Confirm a request once the developer has agreed a slot, mark it completed after the visit, or cancel it. Completing a visit writes a site-visit-completed event to the lead and rescores it."
    />
  );

  if (!env.hasDatabase) {
    return (
      <>
        {header}
        <NoDatabase section="Site visits" />
      </>
    );
  }

  const result = await listSiteVisits({
    status: status ? [status] : undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <>
      {header}
      <Card as="section" aria-label="Filters" className="mt-8 p-6">
        <FilterPills
          label="Status"
          param="status"
          options={STATUS_OPTIONS}
          current={status ? [status] : []}
          base={base}
        />
      </Card>

      {result.ok ? (
        <section aria-label="Site visit results" className="mt-6 flex flex-col gap-4">
          {result.data.items.length === 0 ? (
            <Card>
              <EmptyRows
                title={status ? `No ${SITE_VISIT_STATUS_LABEL[status].toLowerCase()} site visits` : "No site visits yet"}
                body="Requests made through the site-visit form on a property page will appear here."
              />
            </Card>
          ) : (
            <Table caption="Site visits" minWidth="min-w-[80rem]">
              <thead>
                <tr>
                  <Th>Preferred day</Th>
                  <Th>Slot</Th>
                  <Th align="right">Visitors</Th>
                  <Th>Property</Th>
                  <Th>Lead</Th>
                  <Th>Lead stage</Th>
                  <Th>Visit status</Th>
                  <Th>Notes</Th>
                  <Th>Requested</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {result.data.items.map((row) => (
                  <Tr key={row.visit.id}>
                    <Td className="whitespace-nowrap font-medium">{formatCalendarDay(row.visit.preferredDate)}</Td>
                    <Td muted className="whitespace-nowrap">
                      {slotLabel(row.visit.preferredTime)}
                    </Td>
                    <Td align="right" className="tabular">
                      {row.visit.visitors}
                    </Td>
                    <Td>
                      {row.visit.projectSlug
                        ? (getProject(row.visit.projectSlug)?.name ?? row.visit.projectSlug)
                        : "—"}
                    </Td>
                    <Td>
                      {row.lead ? (
                        <Link href={`/admin/leads/${row.lead.id}`} className="underline-offset-4 hover:underline">
                          <span className="font-medium">{row.lead.name}</span>
                          <span className="tabular block font-mono text-xs text-[color:var(--text-muted)]">
                            {row.lead.reference} · {row.lead.phone}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-[color:var(--text-muted)]">Lead removed</span>
                      )}
                    </Td>
                    <Td>
                      {row.lead ? (
                        <span className="flex flex-wrap gap-1.5">
                          <StageChip stage={row.lead.stage} />
                          <LeadStatusChip status={row.lead.status} />
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>
                      <VisitStatusChip status={row.visit.status} />
                    </Td>
                    <Td muted className="max-w-[16rem]">
                      {row.visit.notes ? <span className="line-clamp-2">{row.visit.notes}</span> : "—"}
                    </Td>
                    <Td muted className="whitespace-nowrap">
                      {formatDateTime(row.visit.createdAt)}
                    </Td>
                    <Td>
                      <VisitActions row={row} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
          <Pagination
            page={result.data.page}
            pageSize={result.data.pageSize}
            total={result.data.total}
            base={base}
            noun="site visits"
          />
        </section>
      ) : (
        <DataError message={result.error.message} context="site visits" />
      )}
    </>
  );
}
