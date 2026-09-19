import { appendLeadEvent, createLead, type CreateLeadInput, type RepoError } from "@/db/repositories";
import type { Lead, LeadEventType } from "@/db/schema";
import { logUnrecordedLead, scoreLead, SOURCE_EVENT } from "@/lib/leads";

export type IntakeResult = { ok: true; lead: Lead } | { ok: false; error: RepoError };

/**
 * The one path every CTA on the site ends in. It scores before the insert so a
 * lead is never stored at the wrong stage, and it logs the whole payload at
 * error level if the write fails — the response must then report failure, never
 * a reference code.
 */
export async function intakeLead(params: {
  context: string;
  input: CreateLeadInput;
  event?: { type: LeadEventType; payload?: Record<string, unknown> | null };
}): Promise<IntakeResult> {
  const now = new Date();
  const sourceEvent = params.event?.type ?? SOURCE_EVENT[params.input.source];

  const { score, stage } = scoreLead({
    events: [
      { type: "created", createdAt: now },
      { type: sourceEvent, createdAt: now },
    ],
    profile: {
      email: params.input.email,
      budgetMin: params.input.budgetMin,
      budgetMax: params.input.budgetMax,
      purpose: params.input.purpose,
      projectSlug: params.input.projectSlug,
      consent: params.input.consent,
    },
    now,
  });

  const created = await createLead({ ...params.input, score, stage });
  if (!created.ok) {
    logUnrecordedLead(params.context, params.input);
    return created;
  }

  const lead = created.data;
  const results = await Promise.all([
    appendLeadEvent({ leadId: lead.id, type: "created", payload: { source: params.input.source } }),
    appendLeadEvent({
      leadId: lead.id,
      type: sourceEvent,
      payload: params.event?.payload ?? null,
    }),
  ]);

  for (const result of results) {
    if (!result.ok) {
      console.error(`[lead] ${lead.reference} saved but its audit event was not`, result.error);
    }
  }

  return { ok: true, lead };
}
