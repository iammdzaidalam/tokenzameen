"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { listAdvisors, upsertAdvisor } from "@/db/repositories";
import { guardAction, repoFailure } from "@/components/admin/action-guard";
import { field, type ActionState } from "@/components/admin/action-state";
import { nameSchema, phoneSchema } from "@/lib/validation";

function revalidateAdvisors() {
  revalidatePath("/admin/advisors");
  revalidatePath("/admin/leads");
}

const saveSchema = z.object({
  name: nameSchema,
  email: z.email("Enter a valid email address").trim().max(160).toLowerCase(),
  phone: z.union([z.literal(""), phoneSchema]).transform((value) => (value ? value : null)),
});

export async function saveAdvisorAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = saveSchema.safeParse({
    name: field(formData, "name"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the advisor details." };
  }

  const result = await upsertAdvisor({ ...parsed.data, active: true });
  if (!result.ok) return repoFailure(result.error);

  revalidateAdvisors();
  return { ok: true, message: `${result.data.name} is on the advisors list and active.` };
}

const activeSchema = z.object({
  advisorId: z.uuid(),
  active: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export async function setAdvisorActiveAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = activeSchema.safeParse({
    advisorId: field(formData, "advisorId"),
    active: field(formData, "active"),
  });
  if (!parsed.success) return { ok: false, message: "That change could not be read." };

  const advisors = await listAdvisors();
  if (!advisors.ok) return repoFailure(advisors.error);
  const advisor = advisors.data.find((row) => row.id === parsed.data.advisorId);
  if (!advisor) return { ok: false, message: "That advisor no longer exists." };

  const result = await upsertAdvisor({
    name: advisor.name,
    email: advisor.email,
    phone: advisor.phone,
    active: parsed.data.active,
  });
  if (!result.ok) return repoFailure(result.error);

  revalidateAdvisors();
  return {
    ok: true,
    message: parsed.data.active
      ? `${advisor.name} can be assigned leads again.`
      : `${advisor.name} is deactivated. Existing assignments are kept.`,
  };
}
