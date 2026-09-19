import type { Lead, LeadEvent, LeadStatus } from "@/db/schema";
import { LEAD_STATUSES } from "@/db/schema";
import { LEAD_STATUS_LABEL, scoreLead } from "@/lib/leads";
import { StageChip } from "./chips";
import { formatDateTime, LEAD_EVENT_LABEL } from "./format";

const SHOWN_KEYS = [
  "note",
  "projectSlug",
  "documentId",
  "documentTitle",
  "location",
  "timeline",
  "budgetBand",
  "preferredCallback",
  "siteVisitId",
] as const;

function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
}

function PayloadSummary({
  payload,
  advisorNames,
}: {
  payload: Record<string, unknown> | null;
  advisorNames: Map<string, string>;
}) {
  if (!payload) return null;
  const parts: Array<{ key: string; value: string }> = [];

  if (isLeadStatus(payload.status)) parts.push({ key: "status", value: LEAD_STATUS_LABEL[payload.status] });
  if ("advisorId" in payload) {
    const id = payload.advisorId;
    parts.push({
      key: "advisor",
      value: typeof id === "string" ? (advisorNames.get(id) ?? "Unknown advisor") : "Unassigned",
    });
  }
  for (const key of SHOWN_KEYS) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) parts.push({ key, value });
    else if (typeof value === "number") parts.push({ key, value: String(value) });
  }
  if (parts.length === 0) return null;

  return (
    <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {parts.map((part) => (
        <div key={part.key} className="flex gap-1.5">
          <dt className="text-[color:var(--text-muted)]">{part.key}</dt>
          <dd className={part.key === "note" ? "whitespace-pre-wrap" : ""}>{part.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The score column replays the rules engine over the events up to each row, so
 * every number on the timeline is explainable by the rows above it. Recency
 * decay is applied as of now, which is why an old event can show fewer points
 * today than it earned on the day.
 */
export function LeadTimeline({
  lead,
  events,
  advisorNames,
}: {
  lead: Lead;
  events: LeadEvent[];
  advisorNames: Map<string, string>;
}) {
  const now = new Date();
  const profile = {
    email: lead.email,
    budgetMin: lead.budgetMin,
    budgetMax: lead.budgetMax,
    purpose: lead.purpose,
    projectSlug: lead.projectSlug,
    consent: lead.consent,
  };

  const scores = events.map((_, index) =>
    scoreLead({ events: events.slice(0, index + 1), profile, now }),
  );
  const rows = events.map((event, index) => {
    const current = scores[index];
    const before = index > 0 ? scores[index - 1].score : 0;
    return { event, score: current.score, stage: current.stage, delta: current.score - before };
  });

  if (rows.length === 0) {
    return (
      <p className="px-6 py-10 text-center text-sm text-[color:var(--text-secondary)]">
        No events recorded for this lead.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-[color:var(--hairline)]">
      {rows.map(({ event, score, stage, delta }) => (
        <li key={event.id} className="grid gap-3 px-6 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <p className="text-sm font-medium">{LEAD_EVENT_LABEL[event.type]}</p>
            <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">{formatDateTime(event.createdAt)}</p>
            <PayloadSummary payload={event.payload} advisorNames={advisorNames} />
          </div>
          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <p className="tabular font-display text-xl leading-none">
              {score}
              <span className="ml-1.5 text-xs font-normal text-[color:var(--text-muted)]">
                {delta > 0 ? `+${delta}` : delta < 0 ? String(delta) : "±0"}
              </span>
            </p>
            <StageChip stage={stage} />
          </div>
        </li>
      ))}
    </ol>
  );
}
