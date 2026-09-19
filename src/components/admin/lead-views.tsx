import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Lead } from "@/db/schema";
import { getProject, isCategorySlug } from "@/lib/catalog";
import { CATEGORY_LABEL, PURPOSE_LABEL } from "@/lib/labels";
import { LeadStatusChip, SourceChip, StageChip } from "./chips";
import { formatBudget, formatDateTime, formatDay } from "./format";
import { Table, Td, Th, Tr } from "./table";

function projectName(slug: string | null): string {
  if (!slug) return "—";
  return getProject(slug)?.name ?? slug;
}

function categoryName(slug: string | null): string {
  if (!slug) return "—";
  return isCategorySlug(slug) ? CATEGORY_LABEL[slug] : slug;
}

export function LeadTable({
  leads,
  advisorNames,
}: {
  leads: Lead[];
  advisorNames: Map<string, string>;
}) {
  return (
    <Table caption="Leads" minWidth="min-w-[92rem]">
      <thead>
        <tr>
          <Th>Reference</Th>
          <Th>Name</Th>
          <Th>Phone</Th>
          <Th>Property</Th>
          <Th>Category</Th>
          <Th>Budget</Th>
          <Th>Purpose</Th>
          <Th>Source</Th>
          <Th align="right">Score</Th>
          <Th>Stage</Th>
          <Th>Status</Th>
          <Th>Advisor</Th>
          <Th>Last contact</Th>
          <Th>Next follow-up</Th>
          <Th>Created</Th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <Tr key={lead.id}>
            <Td>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="tabular font-mono text-xs text-[color:var(--accent)] underline-offset-4 hover:underline"
              >
                {lead.reference}
              </Link>
            </Td>
            <Td>
              <span className="font-medium">{lead.name}</span>
              {lead.email ? (
                <span className="block text-xs text-[color:var(--text-muted)]">{lead.email}</span>
              ) : null}
            </Td>
            <Td className="tabular whitespace-nowrap">{lead.phone}</Td>
            <Td>{projectName(lead.projectSlug)}</Td>
            <Td muted>{categoryName(lead.categorySlug)}</Td>
            <Td className="whitespace-nowrap">{formatBudget(lead.budgetMin, lead.budgetMax)}</Td>
            <Td muted>{lead.purpose ? PURPOSE_LABEL[lead.purpose] : "—"}</Td>
            <Td>
              <SourceChip source={lead.source} />
            </Td>
            <Td align="right" className="tabular font-display text-base">
              {lead.score}
            </Td>
            <Td>
              <StageChip stage={lead.stage} />
            </Td>
            <Td>
              <LeadStatusChip status={lead.status} />
            </Td>
            <Td muted>{lead.advisorId ? (advisorNames.get(lead.advisorId) ?? "Unknown advisor") : "Unassigned"}</Td>
            <Td muted className="whitespace-nowrap">
              {formatDateTime(lead.lastContactAt)}
            </Td>
            <Td muted className="whitespace-nowrap">
              {formatDay(lead.nextFollowUpAt)}
            </Td>
            <Td muted className="whitespace-nowrap">
              {formatDateTime(lead.createdAt)}
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}

export function LeadCards({
  leads,
  advisorNames,
}: {
  leads: Lead[];
  advisorNames: Map<string, string>;
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {leads.map((lead) => (
        <li key={lead.id}>
          <Link
            href={`/admin/leads/${lead.id}`}
            className="group flex h-full flex-col gap-4 rounded-card border border-[color:var(--hairline)] bg-white p-5 transition-colors hover:border-[color:var(--hairline-strong)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="tabular font-mono text-xs text-[color:var(--text-muted)]">{lead.reference}</p>
                <p className="mt-1 truncate font-display text-lg font-medium">{lead.name}</p>
                <p className="tabular text-xs text-[color:var(--text-secondary)]">{lead.phone}</p>
              </div>
              <span className="tabular shrink-0 font-display text-display-sm leading-none">{lead.score}</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <dt className="text-[color:var(--text-muted)]">Property</dt>
              <dd className="truncate">{projectName(lead.projectSlug)}</dd>
              <dt className="text-[color:var(--text-muted)]">Budget</dt>
              <dd>{formatBudget(lead.budgetMin, lead.budgetMax)}</dd>
              <dt className="text-[color:var(--text-muted)]">Advisor</dt>
              <dd>{lead.advisorId ? (advisorNames.get(lead.advisorId) ?? "Unknown") : "Unassigned"}</dd>
              <dt className="text-[color:var(--text-muted)]">Follow-up</dt>
              <dd>{formatDay(lead.nextFollowUpAt)}</dd>
            </dl>
            <div className="mt-auto flex flex-wrap items-center gap-1.5">
              <SourceChip source={lead.source} />
              <StageChip stage={lead.stage} />
              <LeadStatusChip status={lead.status} />
              <span className="ml-auto grid size-8 place-items-center rounded-full border border-[color:var(--hairline)] transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:rotate-45">
                <ArrowUpRight aria-hidden className="size-3.5" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
