import type { Metadata } from "next";
import { listInventory } from "@/db/repositories";
import {
  AREA_UNITS,
  BEDROOM_CONFIGS,
  INVENTORY_KINDS,
  UNIT_STATUSES,
  type InventoryKind,
  type InventoryUnitRow,
} from "@/db/schema";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, CardHeader, Notice } from "@/components/admin/card";
import { BooleanChip } from "@/components/admin/chips";
import { formatRupees } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/components/admin/require-admin";
import { DataError, EmptyRows, NoDatabase } from "@/components/admin/states";
import { Table, Td, Th, Tr } from "@/components/admin/table";
import { Checkbox, Field, Select, TextInput } from "@/components/ui/field";
import { getAllProjects, getProject } from "@/lib/catalog";
import { DISCLAIMERS } from "@/content/config";
import { env } from "@/lib/env";
import { bedroomLabel, formatArea } from "@/lib/format";
import { UNIT_STATUS_LABEL } from "@/lib/labels";
import { deleteUnitAction, saveUnitAction, setUnitStatusAction } from "./actions";

export const metadata: Metadata = { title: "Inventory" };

const KIND_LABEL: Record<InventoryKind, string> = {
  apartment: "Apartment",
  villa: "Villa",
  commercial: "Commercial",
  plot: "Plot",
};

const AREA_UNIT_LABEL: Record<(typeof AREA_UNITS)[number], string> = {
  sqft: "sq. ft.",
  sqyd: "sq. yd.",
  acre: "acre",
};

function areaOf(row: InventoryUnitRow): string {
  if (row.areaMin === null || row.areaUnit === null) return "—";
  return formatArea({ min: row.areaMin, max: row.areaMax, unit: row.areaUnit });
}

function groupByProject(rows: InventoryUnitRow[]): Array<[string, InventoryUnitRow[]]> {
  const groups = new Map<string, InventoryUnitRow[]>();
  for (const row of rows) {
    const list = groups.get(row.projectSlug) ?? [];
    list.push(row);
    groups.set(row.projectSlug, list);
  }
  return [...groups.entries()];
}

function StatusCell({ row }: { row: InventoryUnitRow }) {
  const selectId = `unit-status-${row.id}`;
  return (
    <ActionForm action={setUnitStatusAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="unitId" value={row.id} />
      <input type="hidden" name="projectSlug" value={row.projectSlug} />
      <label htmlFor={selectId} className="sr-only">
        Status for {row.unitNumber}
      </label>
      <Select id={selectId} name="status" defaultValue={row.status} className="h-9 min-w-[8.5rem] py-1.5">
        {UNIT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {UNIT_STATUS_LABEL[status]}
          </option>
        ))}
      </Select>
      <SubmitButton variant="secondary" pendingLabel="Saving…">
        Save
      </SubmitButton>
    </ActionForm>
  );
}

function DeleteCell({ row }: { row: InventoryUnitRow }) {
  return (
    <ActionForm action={deleteUnitAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="unitId" value={row.id} />
      <input type="hidden" name="projectSlug" value={row.projectSlug} />
      <SubmitButton
        variant="ghost"
        confirm={`Remove unit ${row.unitNumber} from ${row.projectSlug}? This cannot be undone.`}
        pendingLabel="Removing…"
      >
        Remove
      </SubmitButton>
    </ActionForm>
  );
}

function AddUnitForm() {
  const projects = getAllProjects();
  return (
    <ActionForm action={saveUnitAction} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Field label="Project" htmlFor="unit-project" required>
        <Select id="unit-project" name="projectSlug" defaultValue="" required>
          <option value="" disabled>
            Choose a project
          </option>
          {projects.map((project) => (
            <option key={project.slug} value={project.slug}>
              {project.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Kind" htmlFor="unit-kind" required>
        <Select id="unit-kind" name="kind" defaultValue="apartment">
          {INVENTORY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {KIND_LABEL[kind]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Unit number" htmlFor="unit-number" required hint="Unique within the project; saving an existing number updates it.">
        <TextInput id="unit-number" name="unitNumber" required maxLength={40} />
      </Field>
      <Field label="Tower" htmlFor="unit-tower">
        <TextInput id="unit-tower" name="tower" maxLength={40} />
      </Field>
      <Field label="Floor" htmlFor="unit-floor">
        <TextInput id="unit-floor" name="floor" inputMode="numeric" />
      </Field>
      <Field label="Configuration" htmlFor="unit-bedrooms">
        <Select id="unit-bedrooms" name="bedrooms" defaultValue="">
          <option value="">Not applicable</option>
          {BEDROOM_CONFIGS.map((config) => (
            <option key={config} value={config}>
              {bedroomLabel(config)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Area, minimum" htmlFor="unit-area-min">
        <TextInput id="unit-area-min" name="areaMin" inputMode="decimal" />
      </Field>
      <Field label="Area, maximum" htmlFor="unit-area-max" hint="Leave empty when the area is a single figure.">
        <TextInput id="unit-area-max" name="areaMax" inputMode="decimal" />
      </Field>
      <Field label="Area unit" htmlFor="unit-area-unit">
        <Select id="unit-area-unit" name="areaUnit" defaultValue="">
          <option value="">Not set</option>
          {AREA_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {AREA_UNIT_LABEL[unit]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Facing" htmlFor="unit-facing">
        <TextInput id="unit-facing" name="facing" maxLength={40} />
      </Field>
      <Field label="Road width (ft)" htmlFor="unit-road">
        <TextInput id="unit-road" name="roadWidthFt" inputMode="numeric" />
      </Field>
      <Field label="Price (whole rupees)" htmlFor="unit-price" hint="₹1 crore is 10000000. Leave empty for price on request.">
        <TextInput id="unit-price" name="priceAmount" inputMode="numeric" />
      </Field>
      <Field label="Monthly rent (whole rupees)" htmlFor="unit-rent">
        <TextInput id="unit-rent" name="monthlyRentAmount" inputMode="numeric" />
      </Field>
      <Field label="Lease status" htmlFor="unit-lease">
        <TextInput id="unit-lease" name="leaseStatus" maxLength={80} />
      </Field>
      <Field label="Tenant" htmlFor="unit-tenant">
        <TextInput id="unit-tenant" name="tenant" maxLength={120} />
      </Field>
      <Field label="Status" htmlFor="unit-status">
        <Select id="unit-status" name="status" defaultValue="available">
          {UNIT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {UNIT_STATUS_LABEL[status]}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex flex-col justify-end gap-2">
        <Checkbox name="isSample" label="Indicative (demonstration data, not an offer)" />
      </div>
      <div className="flex items-end md:col-span-2 xl:col-span-3">
        <SubmitButton pendingLabel="Saving…">Save unit</SubmitButton>
      </div>
    </ActionForm>
  );
}

export default async function InventoryPage() {
  await requireAdmin();

  const header = (
    <PageHeader
      index="04"
      eyebrow="Inventory"
      title="Units, by project."
      lead="Change a unit's status inline, or add a unit with the form below. Units flagged indicative are demonstration rows mirrored from the content file; they are not an offer for sale."
    />
  );

  if (!env.hasDatabase) {
    return (
      <>
        {header}
        <NoDatabase section="Inventory" />
      </>
    );
  }

  const result = await listInventory();

  return (
    <>
      {header}
      {result.ok ? (
        <>
          {result.data.some((row) => row.isSample) ? (
            <Notice tone="warning" className="mt-8">
              Rows marked indicative are demonstration data. {DISCLAIMERS.sampleInventory}
            </Notice>
          ) : null}

          {result.data.length === 0 ? (
            <Card className="mt-8">
              <EmptyRows
                title="No inventory rows"
                body="Run pnpm db:seed to mirror the indicative units from the content file, or add a unit below."
              />
            </Card>
          ) : (
            <div className="mt-8 flex flex-col gap-8">
              {groupByProject(result.data).map(([slug, rows]) => {
                const project = getProject(slug);
                const counts = {
                  available: rows.filter((row) => row.status === "available").length,
                  reserved: rows.filter((row) => row.status === "reserved").length,
                  sold: rows.filter((row) => row.status === "sold").length,
                  sample: rows.filter((row) => row.isSample).length,
                };
                return (
                  <Card as="section" key={slug} aria-label={`Inventory for ${project?.name ?? slug}`}>
                    <CardHeader
                      title={project?.name ?? slug}
                      note={`${rows.length} units · ${counts.available} available · ${counts.reserved} reserved · ${counts.sold} sold · ${counts.sample} indicative${project ? "" : " · slug not in the catalogue"}`}
                    />
                    <Table caption={`Units for ${project?.name ?? slug}`} className="rounded-none border-0" minWidth="min-w-[88rem]">
                      <thead>
                        <tr>
                          <Th>Unit</Th>
                          <Th>Kind</Th>
                          <Th>Tower / floor</Th>
                          <Th>Configuration</Th>
                          <Th>Area</Th>
                          <Th>Facing / road</Th>
                          <Th align="right">Price</Th>
                          <Th align="right">Rent / month</Th>
                          <Th>Tenant / lease</Th>
                          <Th>Data</Th>
                          <Th>Status</Th>
                          <Th>Remove</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <Tr key={row.id}>
                            <Td className="font-medium">{row.unitNumber}</Td>
                            <Td muted>{KIND_LABEL[row.kind]}</Td>
                            <Td muted>
                              {row.tower ?? "—"} / {row.floor ?? "—"}
                            </Td>
                            <Td muted>{row.bedrooms ? bedroomLabel(row.bedrooms) : "—"}</Td>
                            <Td className="whitespace-nowrap">{areaOf(row)}</Td>
                            <Td muted>
                              {row.facing ?? "—"}
                              {row.roadWidthFt !== null ? ` / ${row.roadWidthFt} ft` : ""}
                            </Td>
                            <Td align="right" className="tabular whitespace-nowrap">
                              {formatRupees(row.priceAmount)}
                            </Td>
                            <Td align="right" className="tabular whitespace-nowrap">
                              {formatRupees(row.monthlyRentAmount)}
                            </Td>
                            <Td muted>
                              {row.tenant ?? "—"}
                              {row.leaseStatus ? ` · ${row.leaseStatus}` : ""}
                            </Td>
                            <Td>
                              <BooleanChip value={!row.isSample} yes="Live" no="Indicative" />
                            </Td>
                            <Td>
                              <StatusCell row={row} />
                            </Td>
                            <Td>
                              <DeleteCell row={row} />
                            </Td>
                          </Tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card>
                );
              })}
            </div>
          )}

          <Card as="section" aria-label="Add or update a unit" className="mt-8">
            <CardHeader
              title="Add or update a unit"
              note="Keyed on project and unit number. Money is whole rupees; areas are numbers in the chosen unit. Leave what you do not know empty."
            />
            <div className="p-6">
              <AddUnitForm />
            </div>
          </Card>
        </>
      ) : (
        <DataError message={result.error.message} context="inventory" />
      )}
    </>
  );
}
