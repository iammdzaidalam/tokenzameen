import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById, listAdvisors, listLeadEvents, listSiteVisits } from "@/db/repositories";
import { Card, CardHeader, DefinitionList, Notice } from "@/components/admin/card";
import { LeadStatusChip, SourceChip, StageChip, VisitStatusChip } from "@/components/admin/chips";
import { formatBudget, formatCalendarDay, formatDateTime, formatDay, isUuid } from "@/components/admin/format";
import { LeadTimeline } from "@/components/admin/lead-timeline";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/components/admin/require-admin";
import { DataError, NoDatabase } from "@/components/admin/states";
import { getProject, isCategorySlug } from "@/lib/catalog";
import { env } from "@/lib/env";
import { CATEGORY_LABEL, PURPOSE_LABEL } from "@/lib/labels";
import { LEAD_STAGE_LABEL, scoreLead } from "@/lib/leads";
import { CALLBACK_WINDOW_LABEL, VISIT_SLOT_LABEL, type CallbackWindow, type VisitSlot } from "@/lib/validation";
import { AdvisorForm, NoteForm, RescoreForm, StatusForm } from "./forms";

export const metadata: Metadata = { title: "Lead" };

function callbackLabel(value: string | null): string {
  if (!value) return "—";
  return value in CALLBACK_WINDOW_LABEL ? CALLBACK_WINDOW_LABEL[value as CallbackWindow] : value;
}

function slotLabel(value: string | null): string {
  if (!value) return "Any time";
  return value in VISIT_SLOT_LABEL ? VISIT_SLOT_LABEL[value as VisitSlot] : value;
}

export default async function LeadDetailPage({ params }: PageProps<"/admin/leads/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  if (!env.hasDatabase) {
    return (
      <>
        <PageHeader index="02" eyebrow="Leads" title="Lead" />
        <NoDatabase section="This lead" />
      </>
    );
  }

  const [leadResult, eventsResult, advisorsResult, visitsResult] = await Promise.all([
    getLeadById(id),
    listLeadEvents(id),
    listAdvisors(),
    listSiteVisits({ leadId: id, pageSize: 20 }),
  ]);

  if (!leadResult.ok) {
    if (leadResult.error.code === "not-found") notFound();
    return (
      <>
        <PageHeader index="02" eyebrow="Leads" title="Lead" />
        <DataError message={leadResult.error.message} context="this lead" />
      </>
    );
  }

  const lead = leadResult.data;
  const events = eventsResult.ok ? eventsResult.data : [];
  const advisors = advisorsResult.ok ? advisorsResult.data : [];
  const advisorNames = new Map(advisors.map((advisor) => [advisor.id, advisor.name]));
  const project = lead.projectSlug ? getProject(lead.projectSlug) : null;
  const advisorName = lead.advisorId ? (advisorNames.get(lead.advisorId) ?? "Unknown advisor") : "Unassigned";

  const live = eventsResult.ok
    ? scoreLead({
        events,
        profile: {
          email: lead.email,
          budgetMin: lead.budgetMin,
          budgetMax: lead.budgetMax,
          purpose: lead.purpose,
          projectSlug: lead.projectSlug,
          consent: lead.consent,
        },
      })
    : null;

  const utm = [lead.utmSource, lead.utmMedium, lead.utmCampaign, lead.utmTerm, lead.utmContent]
    .map((value, index) => (value ? `${["source", "medium", "campaign", "term", "content"][index]}=${value}` : null))
    .filter((value): value is string => value !== null);

  return (
    <>
      <PageHeader
        index="02"
        eyebrow={
          <>
            <Link href="/admin/leads" className="hover:text-[color:var(--accent)]">
              Leads
            </Link>{" "}
            / {lead.reference}
          </>
        }
        title={lead.name}
        lead={
          <span className="flex flex-wrap items-center gap-2">
            <SourceChip source={lead.source} />
            <StageChip stage={lead.stage} />
            <LeadStatusChip status={lead.status} />
            <span className="text-xs text-[color:var(--text-muted)]">Created {formatDateTime(lead.createdAt)}</span>
          </span>
        }
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col gap-8">
          <Card as="section" aria-label="Lead record">
            <CardHeader title="Record" note="Every field on the lead row. Unknown values are shown as a dash, not filled in." />
            <div className="px-6">
              <DefinitionList
                items={[
                  { term: "Reference", value: <span className="tabular font-mono">{lead.reference}</span> },
                  {
                    term: "Phone",
                    value: (
                      <a href={`tel:${lead.phone}`} className="tabular underline-offset-4 hover:underline">
                        {lead.phone}
                      </a>
                    ),
                  },
                  {
                    term: "Email",
                    value: lead.email ? (
                      <a href={`mailto:${lead.email}`} className="underline-offset-4 hover:underline">
                        {lead.email}
                      </a>
                    ) : (
                      "—"
                    ),
                  },
                  {
                    term: "Property",
                    value: project ? (
                      <Link href={`/purchase/${project.slug}`} className="underline-offset-4 hover:underline">
                        {project.name}
                      </Link>
                    ) : (
                      (lead.projectSlug ?? "—")
                    ),
                  },
                  {
                    term: "Category",
                    value: lead.categorySlug
                      ? isCategorySlug(lead.categorySlug)
                        ? CATEGORY_LABEL[lead.categorySlug]
                        : lead.categorySlug
                      : "—",
                  },
                  { term: "Budget", value: formatBudget(lead.budgetMin, lead.budgetMax) },
                  { term: "Purpose", value: lead.purpose ? PURPOSE_LABEL[lead.purpose] : "—" },
                  { term: "Preferred callback", value: callbackLabel(lead.preferredCallback) },
                  {
                    term: "Message",
                    value: lead.message ? <span className="whitespace-pre-wrap">{lead.message}</span> : "—",
                  },
                  { term: "Consent", value: lead.consent ? "Agreed to be contacted" : "Not recorded" },
                  { term: "Advisor", value: advisorName },
                  { term: "Last contact", value: formatDateTime(lead.lastContactAt) },
                  { term: "Next follow-up", value: formatDay(lead.nextFollowUpAt) },
                  { term: "UTM", value: utm.length > 0 ? utm.join(" · ") : "—" },
                  {
                    term: "Client",
                    value: (
                      <span className="text-xs text-[color:var(--text-secondary)]">
                        {lead.ipHash ? "IP recorded as a salted hash" : "IP not recorded"}
                        {lead.userAgent ? ` · ${lead.userAgent.slice(0, 120)}` : ""}
                      </span>
                    ),
                  },
                  { term: "Updated", value: formatDateTime(lead.updatedAt) },
                ]}
              />
            </div>
          </Card>

          <Card as="section" aria-label="Site visits for this lead">
            <CardHeader
              title="Site visits"
              actions={
                <Link href="/admin/site-visits" className="text-xs text-[color:var(--accent)] underline-offset-4 hover:underline">
                  All site visits
                </Link>
              }
            />
            {visitsResult.ok ? (
              visitsResult.data.items.length > 0 ? (
                <ul className="divide-y divide-[color:var(--hairline)]">
                  {visitsResult.data.items.map(({ visit }) => (
                    <li key={visit.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
                      <span>
                        {formatCalendarDay(visit.preferredDate)} · {slotLabel(visit.preferredTime)} ·{" "}
                        {visit.visitors} {visit.visitors === 1 ? "visitor" : "visitors"}
                        {visit.projectSlug ? ` · ${getProject(visit.projectSlug)?.name ?? visit.projectSlug}` : ""}
                      </span>
                      <VisitStatusChip status={visit.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-6 py-6 text-sm text-[color:var(--text-secondary)]">No site visits requested.</p>
              )
            ) : (
              <p className="px-6 py-6 text-sm text-signal-danger">{visitsResult.error.message}</p>
            )}
          </Card>

          <Card as="section" aria-label="Timeline">
            <CardHeader
              title="Timeline"
              note="Every event in lead_events, oldest first, with the score the rules engine gives after each one."
            />
            {eventsResult.ok ? (
              <LeadTimeline lead={lead} events={events} advisorNames={advisorNames} />
            ) : (
              <p className="px-6 py-6 text-sm text-signal-danger">{eventsResult.error.message}</p>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card as="section" aria-label="Score" className="p-6">
            <p className="text-sm font-medium text-[color:var(--text-secondary)]">Stored score</p>
            <p className="tabular mt-3 font-display text-display-lg leading-none">{lead.score}</p>
            <div className="mt-3 flex items-center gap-2">
              <StageChip stage={lead.stage} />
              <span className="text-xs text-[color:var(--text-muted)]">out of 100</span>
            </div>
            {live && (live.score !== lead.score || live.stage !== lead.stage) ? (
              <Notice tone="warning" className="mt-4">
                Replaying the timeline today gives {live.score} ({LEAD_STAGE_LABEL[live.stage]}) because older
                events decay. Recalculate to store that.
              </Notice>
            ) : null}
            <div className="mt-5">
              <RescoreForm leadId={lead.id} />
            </div>
          </Card>

          <Card as="section" aria-label="Update status" className="p-6">
            <h2 className="font-display text-lg font-medium">Status and follow-up</h2>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
              Saving records a status-change event and sets last contact to now.
            </p>
            <div className="mt-5">
              <StatusForm lead={lead} />
            </div>
          </Card>

          <Card as="section" aria-label="Assign advisor" className="p-6">
            <h2 className="font-display text-lg font-medium">Advisor</h2>
            <div className="mt-5">
              {advisorsResult.ok ? (
                <AdvisorForm lead={lead} advisors={advisors} />
              ) : (
                <p className="text-sm text-signal-danger">{advisorsResult.error.message}</p>
              )}
            </div>
          </Card>

          <Card as="section" aria-label="Add note" className="p-6">
            <h2 className="font-display text-lg font-medium">Note</h2>
            <div className="mt-5">
              <NoteForm leadId={lead.id} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
