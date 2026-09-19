import { SHOW_SAMPLE_INVENTORY } from "@/content/config";
import type { InventoryUnit, PlotUnit, Project, PropertyType } from "@/types/catalog";

export const DETAIL_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "gallery", label: "Gallery" },
  { id: "location", label: "Location" },
  { id: "inventory", label: "Inventory" },
  { id: "intelligence", label: "Intelligence" },
  { id: "documents", label: "Documents" },
  { id: "faqs", label: "FAQs" },
] as const;

export type DetailSectionId = (typeof DETAIL_SECTIONS)[number]["id"];

const EMI_ELIGIBLE_TYPES: PropertyType[] = [
  "apartment",
  "villa",
  "sustainable-villa",
  "spiritual-residence",
];

export function showsEmiCalculator(project: Project): boolean {
  return project.propertyTypes.some((type) => EMI_ELIGIBLE_TYPES.includes(type));
}

export function showsRoiCalculator(project: Project): boolean {
  return project.propertyTypes.includes("commercial") || project.commercial !== null;
}

export function visibleInventory(project: Project): InventoryUnit[] {
  if (SHOW_SAMPLE_INVENTORY) return project.inventory;
  return project.inventory.filter((unit) => !unit.sample);
}

export function plottedUnits(units: InventoryUnit[]): PlotUnit[] {
  return units.filter((unit): unit is PlotUnit => unit.kind === "plot" && unit.plan !== null);
}

export function hasSampleRows(units: InventoryUnit[]): boolean {
  return units.some((unit) => unit.sample);
}

export function hasCommercialTerms(project: Project): boolean {
  const terms = project.commercial;
  if (!terms) return false;
  return (
    terms.propertyValue !== null ||
    terms.initialInvestment !== null ||
    terms.monthlyRent !== null ||
    terms.annualRent !== null ||
    terms.grossYieldPercent !== null ||
    terms.ownership !== null ||
    terms.leaseTenure !== null
  );
}

export const ACCENT_BY_CATEGORY = {
  apartments: "gold",
  villas: "gold",
  commercial: "gold",
  "sustainable-living": "sage",
  "spiritual-residences": "lotus",
  plots: "gold",
} as const;

export function sectionIndexer(): () => string {
  let count = 0;
  return () => String(++count).padStart(2, "0");
}
