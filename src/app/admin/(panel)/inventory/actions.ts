"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  deleteInventoryUnit,
  listInventory,
  upsertInventoryUnit,
  type UpsertInventoryUnitInput,
} from "@/db/repositories";
import {
  AREA_UNITS,
  BEDROOM_CONFIGS,
  INVENTORY_KINDS,
  UNIT_STATUSES,
  type InventoryUnitRow,
} from "@/db/schema";
import { guardAction, repoFailure } from "@/components/admin/action-guard";
import { field, type ActionState } from "@/components/admin/action-state";
import { getProject } from "@/lib/catalog";
import { UNIT_STATUS_LABEL } from "@/lib/labels";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function revalidateInventory(projectSlug: string) {
  revalidatePath("/admin/inventory");
  revalidatePath(`/purchase/${projectSlug}`);
}

function toInput(row: InventoryUnitRow): UpsertInventoryUnitInput {
  return {
    projectSlug: row.projectSlug,
    kind: row.kind,
    unitNumber: row.unitNumber,
    tower: row.tower,
    floor: row.floor,
    bedrooms: row.bedrooms,
    areaMin: row.areaMin,
    areaMax: row.areaMax,
    areaUnit: row.areaUnit,
    facing: row.facing,
    roadWidthFt: row.roadWidthFt,
    priceAmount: row.priceAmount,
    monthlyRentAmount: row.monthlyRentAmount,
    leaseStatus: row.leaseStatus,
    tenant: row.tenant,
    status: row.status,
    isSample: row.isSample,
    planX: row.planX,
    planY: row.planY,
    planW: row.planW,
    planH: row.planH,
  };
}

const statusSchema = z.object({
  unitId: z.uuid(),
  projectSlug: z.string().regex(SLUG),
  status: z.enum(UNIT_STATUSES),
});

export async function setUnitStatusAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = statusSchema.safeParse({
    unitId: field(formData, "unitId"),
    projectSlug: field(formData, "projectSlug"),
    status: field(formData, "status"),
  });
  if (!parsed.success) return { ok: false, message: "Choose a status from the list." };

  const units = await listInventory({ projectSlug: parsed.data.projectSlug });
  if (!units.ok) return repoFailure(units.error);
  const row = units.data.find((unit) => unit.id === parsed.data.unitId);
  if (!row) return { ok: false, message: "That unit no longer exists." };

  const result = await upsertInventoryUnit({ ...toInput(row), status: parsed.data.status });
  if (!result.ok) return repoFailure(result.error);

  revalidateInventory(row.projectSlug);
  return { ok: true, message: `${row.unitNumber} is now ${UNIT_STATUS_LABEL[parsed.data.status].toLowerCase()}.` };
}

const deleteSchema = z.object({ unitId: z.uuid(), projectSlug: z.string().regex(SLUG) });

export async function deleteUnitAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = deleteSchema.safeParse({
    unitId: field(formData, "unitId"),
    projectSlug: field(formData, "projectSlug"),
  });
  if (!parsed.success) return { ok: false, message: "Missing unit." };

  const result = await deleteInventoryUnit(parsed.data.unitId);
  if (!result.ok) return repoFailure(result.error);

  revalidateInventory(parsed.data.projectSlug);
  return { ok: true, message: "Unit removed." };
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : null));

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.literal(""), z.enum(values)]).transform((value) => (value ? value : null));

const optionalNumber = (integer: boolean) =>
  z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value.length === 0) return null;
      const parsed = Number(value.replace(/,/g, ""));
      const valid = integer ? Number.isInteger(parsed) : Number.isFinite(parsed);
      if (!valid || parsed < 0) {
        ctx.addIssue({ code: "custom", message: integer ? "Enter a whole number" : "Enter a number" });
        return z.NEVER;
      }
      return parsed;
    });

const unitSchema = z.object({
  projectSlug: z.string().regex(SLUG, "Choose a project"),
  kind: z.enum(INVENTORY_KINDS),
  unitNumber: z.string().trim().min(1, "Unit number is required").max(40),
  tower: optionalText(40),
  floor: optionalNumber(true),
  bedrooms: optionalEnum(BEDROOM_CONFIGS),
  areaMin: optionalNumber(false),
  areaMax: optionalNumber(false),
  areaUnit: optionalEnum(AREA_UNITS),
  facing: optionalText(40),
  roadWidthFt: optionalNumber(true),
  priceAmount: optionalNumber(true),
  monthlyRentAmount: optionalNumber(true),
  leaseStatus: optionalText(80),
  tenant: optionalText(120),
  status: z.enum(UNIT_STATUSES),
  isSample: z.boolean(),
});

export async function saveUnitAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await guardAction();
  if (guard) return guard;

  const parsed = unitSchema.safeParse({
    projectSlug: field(formData, "projectSlug"),
    kind: field(formData, "kind"),
    unitNumber: field(formData, "unitNumber"),
    tower: field(formData, "tower"),
    floor: field(formData, "floor"),
    bedrooms: field(formData, "bedrooms"),
    areaMin: field(formData, "areaMin"),
    areaMax: field(formData, "areaMax"),
    areaUnit: field(formData, "areaUnit"),
    facing: field(formData, "facing"),
    roadWidthFt: field(formData, "roadWidthFt"),
    priceAmount: field(formData, "priceAmount"),
    monthlyRentAmount: field(formData, "monthlyRentAmount"),
    leaseStatus: field(formData, "leaseStatus"),
    tenant: field(formData, "tenant"),
    status: field(formData, "status"),
    isSample: formData.get("isSample") === "on",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue ? `${String(issue.path[0] ?? "Form")}: ${issue.message}` : "Check the form." };
  }

  const values = parsed.data;
  if (!getProject(values.projectSlug)) return { ok: false, message: "That project is not in the catalogue." };
  if (values.areaMin !== null && values.areaMax !== null && values.areaMax < values.areaMin) {
    return { ok: false, message: "Maximum area must not be smaller than minimum area." };
  }
  if ((values.areaMin !== null || values.areaMax !== null) && values.areaUnit === null) {
    return { ok: false, message: "Choose an area unit." };
  }

  const result = await upsertInventoryUnit(values);
  if (!result.ok) return repoFailure(result.error);

  revalidateInventory(values.projectSlug);
  return { ok: true, message: `Saved ${result.data.unitNumber} for ${values.projectSlug}.` };
}
