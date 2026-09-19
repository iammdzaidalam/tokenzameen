import { closeDb } from "../src/db/client";
import { listInventory, upsertAdvisor, upsertInventoryUnit } from "../src/db/repositories";
import type { UpsertInventoryUnitInput } from "../src/db/repositories";
import { projects } from "../src/content/projects";
import type { Area, InventoryUnit } from "../src/types/catalog";

function area(value: Area | null): Pick<UpsertInventoryUnitInput, "areaMin" | "areaMax" | "areaUnit"> {
  if (!value) return { areaMin: null, areaMax: null, areaUnit: null };
  return { areaMin: value.min, areaMax: value.max, areaUnit: value.unit };
}

/**
 * The content file is the source of truth until admin-managed inventory lands.
 * `sample: true` rows carry `isSample` into the database so the UI keeps showing
 * DISCLAIMERS.sampleInventory alongside them.
 */
function toRow(projectSlug: string, unit: InventoryUnit): UpsertInventoryUnitInput {
  const base = {
    projectSlug,
    status: unit.status,
    isSample: unit.sample,
    priceAmount: unit.price?.amount ?? null,
  };

  switch (unit.kind) {
    case "plot":
      return {
        ...base,
        kind: "plot",
        unitNumber: unit.plotNumber,
        facing: unit.facing,
        roadWidthFt: unit.roadWidthFt,
        planX: unit.plan?.x ?? null,
        planY: unit.plan?.y ?? null,
        planW: unit.plan?.w ?? null,
        planH: unit.plan?.h ?? null,
        ...area(unit.area),
      };
    case "commercial":
      return {
        ...base,
        kind: "commercial",
        unitNumber: unit.unitNumber,
        floor: unit.floor,
        monthlyRentAmount: unit.monthlyRent?.amount ?? null,
        leaseStatus: unit.leaseStatus,
        tenant: unit.tenant,
        ...area(unit.area),
      };
    case "apartment":
      return {
        ...base,
        kind: "apartment",
        unitNumber: unit.unitNumber,
        tower: unit.tower,
        floor: unit.floor,
        bedrooms: unit.bedrooms,
        ...area(unit.area),
      };
    case "villa":
      return {
        ...base,
        kind: "villa",
        unitNumber: unit.villaNumber,
        bedrooms: unit.bedrooms,
        ...area(unit.builtUpArea ?? unit.plotArea),
      };
  }
}

async function seedAdvisor(): Promise<number> {
  const email = process.env.SEED_ADVISOR_EMAIL ?? process.env.NEXT_PUBLIC_ADVISOR_EMAIL;
  if (!email) {
    console.log(
      "· advisors: skipped — set SEED_ADVISOR_EMAIL (or NEXT_PUBLIC_ADVISOR_EMAIL) to seed the advisory desk.",
    );
    return 0;
  }

  const result = await upsertAdvisor({
    name: process.env.SEED_ADVISOR_NAME ?? "TokenZameen Advisory Desk",
    email,
    phone: process.env.SEED_ADVISOR_PHONE ?? process.env.NEXT_PUBLIC_ADVISOR_PHONE ?? null,
    active: true,
  });

  if (!result.ok) {
    console.error(`· advisors: failed — ${result.error.code}: ${result.error.message}`);
    return 0;
  }
  console.log(`· advisors: 1 record (${result.data.email})`);
  return 1;
}

async function seedInventory(): Promise<number> {
  let written = 0;
  for (const project of projects) {
    const sampleUnits = project.inventory.filter((unit) => unit.sample);
    for (const unit of sampleUnits) {
      const result = await upsertInventoryUnit(toRow(project.slug, unit));
      if (!result.ok) {
        console.error(
          `· inventory: ${project.slug} — failed on a unit: ${result.error.code}: ${result.error.message}`,
        );
        return written;
      }
      written += 1;
    }
    if (sampleUnits.length > 0) {
      console.log(`· inventory: ${project.slug} — ${sampleUnits.length} sample units`);
    }
  }
  return written;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Finish provisioning first — see docs/DATA.md — then run `vercel env pull` and try again.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("Seeding TokenZameen…");
  const advisors = await seedAdvisor();
  const units = await seedInventory();

  const check = await listInventory();
  if (check.ok) {
    console.log(`\nDone. ${advisors} advisor(s), ${units} unit(s) written; ${check.data.length} units in table.`);
  } else {
    console.error(`\nSeed finished but the verification read failed: ${check.error.message}`);
    process.exitCode = 1;
  }
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
