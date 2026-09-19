import type { Advisor, Lead } from "@/db/schema";
import { LEAD_STATUSES } from "@/db/schema";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { toDateInputValue } from "@/components/admin/format";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { LEAD_STATUS_LABEL } from "@/lib/leads";
import {
  addNoteAction,
  assignAdvisorAction,
  rescoreLeadAction,
  updateLeadStatusAction,
} from "../actions";

export function StatusForm({ lead }: { lead: Lead }) {
  const statusId = `status-${lead.id}`;
  const followUpId = `follow-up-${lead.id}`;
  const noteId = `status-note-${lead.id}`;
  return (
    <ActionForm action={updateLeadStatusAction} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={lead.id} />
      <Field label="Status" htmlFor={statusId}>
        <Select id={statusId} name="status" defaultValue={lead.status}>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {LEAD_STATUS_LABEL[status]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Next follow-up" htmlFor={followUpId} hint="A calendar day in IST. Leave empty to clear.">
        <TextInput
          id={followUpId}
          name="nextFollowUpAt"
          type="date"
          defaultValue={toDateInputValue(lead.nextFollowUpAt)}
        />
      </Field>
      <Field label="Note for the timeline" htmlFor={noteId}>
        <TextArea id={noteId} name="note" maxLength={1000} rows={3} className="min-h-20" />
      </Field>
      <div>
        <SubmitButton pendingLabel="Saving…">Save status</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function AdvisorForm({ lead, advisors }: { lead: Lead; advisors: Advisor[] }) {
  const selectId = `advisor-${lead.id}`;
  const current = lead.advisorId ? advisors.find((advisor) => advisor.id === lead.advisorId) : null;
  const options = advisors.filter((advisor) => advisor.active || advisor.id === lead.advisorId);
  return (
    <ActionForm action={assignAdvisorAction} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={lead.id} />
      <Field
        label="Advisor"
        htmlFor={selectId}
        hint={
          lead.advisorId && !current
            ? "The assigned advisor is not in the advisors table."
            : options.length === 0
              ? "Add an advisor first."
              : undefined
        }
      >
        <Select id={selectId} name="advisorId" defaultValue={lead.advisorId ?? ""}>
          <option value="">Unassigned</option>
          {options.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>
              {advisor.name}
              {advisor.active ? "" : " (inactive)"}
            </option>
          ))}
        </Select>
      </Field>
      <div>
        <SubmitButton pendingLabel="Assigning…">Assign</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function NoteForm({ leadId }: { leadId: string }) {
  const noteId = `note-${leadId}`;
  return (
    <ActionForm action={addNoteAction} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={leadId} />
      <Field label="Note" htmlFor={noteId} hint="Notes score nothing; they are audit entries on the timeline.">
        <TextArea id={noteId} name="note" maxLength={1000} required rows={3} className="min-h-20" />
      </Field>
      <div>
        <SubmitButton pendingLabel="Adding…">Add note</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function RescoreForm({ leadId }: { leadId: string }) {
  return (
    <ActionForm action={rescoreLeadAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      <SubmitButton variant="secondary" pendingLabel="Recalculating…">
        Recalculate score
      </SubmitButton>
    </ActionForm>
  );
}
