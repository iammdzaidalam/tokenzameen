"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  appendLeadEvent,
  assignAdvisor,
  rescoreLead,
  updateLeadStatus,
} from "@/db/repositories";
import { LEAD_STATUSES } from "@/db/schema";
import { guardAction, repoFailure } from "@/components/admin/action-guard";
import { field, type ActionState } from "@/components/admin/action-state";
import { dateInputToInstant } from "@/components/admin/format";
import { LEAD_STAGE_LABEL, LEAD_STATUS_LABEL } from "@/lib/leads";

function revalidateLead(leadId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

const statusSchema = z.object({
  leadId: z.uuid(),
  status: z.enum(LEAD_STATUSES),
  nextFollowUpAt: z.string().max(10),
  note: z.string().trim().max(1000),
});

export async function updateLeadStatusAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = statusSchema.safeParse({
    leadId: field(formData, "leadId"),
    status: field(formData, "status"),
    nextFollowUpAt: field(formData, "nextFollowUpAt"),
    note: field(formData, "note"),
  });
  if (!parsed.success) return { ok: false, message: "Check the status and follow-up date." };

  const { leadId, status, note } = parsed.data;
  const followUp = parsed.data.nextFollowUpAt ? dateInputToInstant(parsed.data.nextFollowUpAt) : null;
  if (parsed.data.nextFollowUpAt && !followUp) {
    return { ok: false, message: "Enter the follow-up date as YYYY-MM-DD." };
  }

  const result = await updateLeadStatus(leadId, status, {
    nextFollowUpAt: followUp,
    note: note || null,
  });
  if (!result.ok) return repoFailure(result.error);

  revalidateLead(leadId);
  return { ok: true, message: `Status set to ${LEAD_STATUS_LABEL[status]}.` };
}

const advisorSchema = z.object({
  leadId: z.uuid(),
  advisorId: z.union([z.literal(""), z.uuid()]),
});

export async function assignAdvisorAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = advisorSchema.safeParse({
    leadId: field(formData, "leadId"),
    advisorId: field(formData, "advisorId"),
  });
  if (!parsed.success) return { ok: false, message: "Choose an advisor from the list." };

  const advisorId = parsed.data.advisorId || null;
  const result = await assignAdvisor(parsed.data.leadId, advisorId);
  if (!result.ok) return repoFailure(result.error);

  revalidateLead(parsed.data.leadId);
  return { ok: true, message: advisorId ? "Advisor assigned." : "Advisor removed." };
}

const noteSchema = z.object({
  leadId: z.uuid(),
  note: z.string().trim().min(1).max(1000),
});

export async function addNoteAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = noteSchema.safeParse({
    leadId: field(formData, "leadId"),
    note: field(formData, "note"),
  });
  if (!parsed.success) return { ok: false, message: "Write a note of up to 1000 characters." };

  const result = await appendLeadEvent({
    leadId: parsed.data.leadId,
    type: "note",
    payload: { note: parsed.data.note },
  });
  if (!result.ok) return repoFailure(result.error);

  revalidateLead(parsed.data.leadId);
  return { ok: true, message: "Note added to the timeline." };
}

const leadOnlySchema = z.object({ leadId: z.uuid() });

export async function rescoreLeadAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = leadOnlySchema.safeParse({ leadId: field(formData, "leadId") });
  if (!parsed.success) return { ok: false, message: "Missing lead." };

  const result = await rescoreLead(parsed.data.leadId);
  if (!result.ok) return repoFailure(result.error);

  revalidateLead(parsed.data.leadId);
  return {
    ok: true,
    message: `Score is now ${result.data.score} (${LEAD_STAGE_LABEL[result.data.stage]}).`,
  };
}
