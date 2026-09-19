"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appendLeadEvent, rescoreLead, updateSiteVisitStatus } from "@/db/repositories";
import { SITE_VISIT_STATUSES } from "@/db/schema";
import { guardAction, repoFailure } from "@/components/admin/action-guard";
import { field, type ActionState } from "@/components/admin/action-state";
import { SITE_VISIT_STATUS_LABEL } from "@/components/admin/chips";
import { LEAD_STAGE_LABEL } from "@/lib/leads";

const schema = z.object({
  visitId: z.uuid(),
  leadId: z.union([z.literal(""), z.uuid()]),
  status: z.enum(SITE_VISIT_STATUSES),
});

export async function setSiteVisitStatusAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = schema.safeParse({
    visitId: field(formData, "visitId"),
    leadId: field(formData, "leadId"),
    status: field(formData, "status"),
  });
  if (!parsed.success) return { ok: false, message: "That change could not be read." };

  const { visitId, status } = parsed.data;
  const leadId = parsed.data.leadId || null;

  const result = await updateSiteVisitStatus(visitId, status);
  if (!result.ok) return repoFailure(result.error);

  let detail = "";
  if (status === "completed" && leadId) {
    const event = await appendLeadEvent({
      leadId,
      type: "site-visit-completed",
      payload: { siteVisitId: visitId, projectSlug: result.data.projectSlug },
    });
    if (event.ok) {
      const rescored = await rescoreLead(leadId);
      detail = rescored.ok
        ? ` Lead rescored to ${rescored.data.score} (${LEAD_STAGE_LABEL[rescored.data.stage]}).`
        : " The lead could not be rescored; use Recalculate on the lead.";
    } else {
      detail = " The visit is completed, but the lead event could not be written.";
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/site-visits");
  revalidatePath("/admin/leads");
  if (leadId) revalidatePath(`/admin/leads/${leadId}`);

  return { ok: true, message: `Site visit marked ${SITE_VISIT_STATUS_LABEL[status].toLowerCase()}.${detail}` };
}
