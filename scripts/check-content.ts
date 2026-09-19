import { existsSync } from "node:fs";
import { join } from "node:path";
import { projects } from "../src/content/projects";
import { categories } from "../src/content/categories";
import type { Area, Project } from "../src/types/catalog";

/**
 * Guards the one rule that matters most on a property site: no factual value may
 * appear in the catalogue unless the brief states it. Every allowlisted number
 * below cites the page of docs/prd that supplies it.
 */

const SOURCED_AMOUNTS = new Map<number, string>([
  [10_000_000, "PRD 01 p.11 & p.14 — Omaxe Chowk property value / ₹1 Cr onwards"],
  [5_000_000, "PRD 01 p.11 — Omaxe Chowk initial investment ₹50 Lakh"],
  [75_000, "PRD 01 p.11, PRD 02 p.15 — Omaxe Chowk monthly rent"],
  [900_000, "PRD 02 p.15 — Omaxe Chowk annual rent ₹9 Lakh"],
]);

const SOURCED_PERCENTS = new Map<number, string>([
  [9, "PRD 02 p.15 — Omaxe Chowk gross rental yield"],
]);

const SOURCED_AREA_BOUNDS = new Map<string, [number, number]>([
  ["garden-court", [360, 515]],
]);

const BANNED_SUBSTRINGS = [
  "lorem ipsum",
  "todo",
  "fixme",
  "placeholder text",
  "xxxx",
  "tbd",
  "coming soon soon",
];

const errors: string[] = [];
const warnings: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function warn(message: string) {
  warnings.push(message);
}

function checkAmount(project: Project, label: string, amount: number | null | undefined) {
  if (amount === null || amount === undefined) return;
  if (!SOURCED_AMOUNTS.has(amount)) {
    fail(
      `${project.slug}: ${label} is ₹${amount.toLocaleString("en-IN")}, which is not a figure the brief supplies. ` +
        `Set it to null, or add it to SOURCED_AMOUNTS in scripts/check-content.ts with its source.`,
    );
  }
}

function checkArea(project: Project, label: string, area: Area | null, allowSample: boolean) {
  if (!area) return;
  const bounds = SOURCED_AREA_BOUNDS.get(project.slug);
  if (!bounds) {
    fail(`${project.slug}: ${label} states an area, but the brief gives no dimensions for this project.`);
    return;
  }
  const [min, max] = bounds;
  const values = [area.min, area.max].filter((v): v is number => typeof v === "number");
  for (const value of values) {
    if (value < min || value > max) {
      fail(
        `${project.slug}: ${label} value ${value} falls outside the sourced range ${min}–${max}.`,
      );
    }
  }
  if (!allowSample && (area.min !== min || area.max !== max)) {
    fail(`${project.slug}: ${label} does not match the sourced range ${min}–${max}.`);
  }
}

function checkText(project: Project, label: string, text: string) {
  const lowered = text.toLowerCase();
  for (const banned of BANNED_SUBSTRINGS) {
    if (lowered.includes(banned)) {
      fail(`${project.slug}: ${label} contains placeholder text (“${banned}”).`);
    }
  }
}

const slugs = new Set<string>();

for (const project of projects) {
  if (slugs.has(project.slug)) fail(`Duplicate project slug: ${project.slug}`);
  slugs.add(project.slug);

  if (!/^[a-z0-9-]+$/.test(project.slug)) fail(`${project.slug}: slug must be kebab-case.`);

  if (!project.categories.includes(project.primaryCategory)) {
    fail(`${project.slug}: primaryCategory is not in categories.`);
  }
  for (const category of project.categories) {
    if (!categories.some((c) => c.slug === category)) {
      fail(`${project.slug}: unknown category “${category}”.`);
    }
  }

  checkAmount(project, "priceFrom", project.priceFrom?.amount);
  checkArea(project, "area", project.area, false);

  if (project.commercial) {
    checkAmount(project, "commercial.propertyValue", project.commercial.propertyValue?.amount);
    checkAmount(project, "commercial.initialInvestment", project.commercial.initialInvestment?.amount);
    checkAmount(project, "commercial.monthlyRent", project.commercial.monthlyRent?.amount);
    checkAmount(project, "commercial.annualRent", project.commercial.annualRent?.amount);
    const yieldValue = project.commercial.grossYieldPercent;
    if (yieldValue !== null && !SOURCED_PERCENTS.has(yieldValue)) {
      fail(`${project.slug}: gross yield ${yieldValue}% is not a figure the brief supplies.`);
    }
  }

  if (project.reraNumber !== null) {
    fail(
      `${project.slug}: a RERA number is set. The brief supplies none, and inventing one is a legal claim. ` +
        `Keep it null until the registration is on file.`,
    );
  }

  if (project.intelligence !== null) {
    fail(
      `${project.slug}: Property Intelligence scores are set. No assessment exists in the brief; ` +
        `scores must come from a recorded TokenZameen assessment, never from code.`,
    );
  }

  for (const point of project.connectivity) {
    if (point.minutes === null && point.distanceKm === null) {
      fail(`${project.slug}: connectivity entry “${point.label}” carries no verified value.`);
    }
  }

  for (const unit of project.inventory) {
    if (!unit.sample) {
      fail(`${project.slug}: inventory unit ${unit.id} is not flagged as sample, but no live inventory has been supplied.`);
    }
    if (unit.price !== null) {
      fail(`${project.slug}: sample unit ${unit.id} carries a price. Indicative layout data must not quote money.`);
    }
    if (unit.kind === "plot") {
      checkArea(project, `inventory ${unit.id}`, unit.area, true);
      if (unit.plan) {
        const { x, y, w, h } = unit.plan;
        if ([x, y, w, h].some((v) => v < 0 || v > 100)) {
          fail(`${project.slug}: plot ${unit.id} plan coordinates fall outside 0–100.`);
        }
      }
    }
    if (unit.kind === "commercial" && unit.monthlyRent !== null) {
      checkAmount(project, `inventory ${unit.id} monthlyRent`, unit.monthlyRent.amount);
    }
  }

  for (const doc of project.documents) {
    if (doc.href !== null && !doc.href.startsWith("/") && !doc.href.startsWith("https://")) {
      fail(`${project.slug}: document ${doc.id} has an unsafe href.`);
    }
  }

  checkText(project, "summary", project.summary);
  checkText(project, "positioning", project.positioning);
  project.overview.forEach((line, i) => checkText(project, `overview[${i}]`, line));
  project.whyThisProject.forEach((line, i) => checkText(project, `whyThisProject[${i}]`, line));
  project.faqs.forEach((faq, i) => {
    checkText(project, `faqs[${i}].question`, faq.question);
    checkText(project, `faqs[${i}].answer`, faq.answer);
  });

  const media = [project.hero, ...project.gallery, project.masterplan].filter(
    (asset): asset is NonNullable<typeof asset> => asset !== null,
  );
  for (const asset of media) {
    if (!asset.alt.trim()) fail(`${project.slug}: media ${asset.src} has no alt text.`);
    const path = join(process.cwd(), "public", asset.src);
    if (!existsSync(path)) warn(`${project.slug}: media file missing on disk — ${asset.src}`);
  }
}

for (const category of categories) {
  const path = join(process.cwd(), "public", category.hero.src);
  if (!existsSync(path)) warn(`${category.slug}: category artwork missing on disk — ${category.hero.src}`);
  if (!category.hero.alt.trim()) fail(`${category.slug}: category artwork has no alt text.`);
}

const covered = new Set(projects.flatMap((p) => p.categories));
for (const category of categories) {
  if (!covered.has(category.slug)) {
    warn(`${category.slug}: no projects in this category yet — its page must render a designed empty state.`);
  }
}

if (warnings.length) {
  console.warn(`\ncheck:data — ${warnings.length} warning(s)`);
  for (const warning of warnings) console.warn(`  · ${warning}`);
}

if (errors.length) {
  console.error(`\ncheck:data FAILED — ${errors.length} error(s)`);
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}

console.log(`\ncheck:data passed — ${projects.length} projects, ${categories.length} categories verified against the brief.`);
