import { formatArea, formatBedrooms, formatMoney } from "@/lib/format";
import type { InventoryUnit, UnitStatus } from "@/types/catalog";

export interface InventoryCell {
  label: string;
  value: string;
}

export interface InventoryRow {
  id: string;
  title: string;
  status: UnitStatus;
  sample: boolean;
  cells: InventoryCell[];
}

export interface InventoryGroup {
  kind: InventoryUnit["kind"];
  heading: string;
  titleLabel: string;
  statusLabel: string;
  columns: string[];
  rows: InventoryRow[];
}

const KIND_HEADING: Record<InventoryUnit["kind"], string> = {
  plot: "Plots",
  apartment: "Apartments",
  villa: "Villas",
  commercial: "Commercial units",
};

const KIND_TITLE: Record<InventoryUnit["kind"], string> = {
  plot: "Plot",
  apartment: "Unit",
  villa: "Villa",
  commercial: "Unit",
};

const KIND_STATUS: Record<InventoryUnit["kind"], string> = {
  plot: "Status",
  apartment: "Availability",
  villa: "Availability",
  commercial: "Availability",
};

function toCells(unit: InventoryUnit): InventoryCell[] {
  switch (unit.kind) {
    case "plot":
      return [
        { label: "Size", value: formatArea(unit.area) },
        { label: "Facing", value: unit.facing ?? "On request" },
        { label: "Price", value: formatMoney(unit.price) },
      ];
    case "commercial":
      return [
        { label: "Floor", value: unit.floor === null ? "On request" : String(unit.floor) },
        { label: "Area", value: formatArea(unit.area) },
        { label: "Price", value: formatMoney(unit.price) },
        { label: "Monthly rent", value: formatMoney(unit.monthlyRent) },
        { label: "Lease status", value: unit.leaseStatus ?? "On request" },
      ];
    case "apartment":
      return [
        { label: "Tower", value: unit.tower ?? "On request" },
        { label: "Floor", value: unit.floor === null ? "On request" : String(unit.floor) },
        { label: "Configuration", value: formatBedrooms(unit.bedrooms ? [unit.bedrooms] : []) },
        { label: "Area", value: formatArea(unit.area) },
        { label: "Price", value: formatMoney(unit.price) },
      ];
    case "villa":
      return [
        { label: "Plot area", value: formatArea(unit.plotArea) },
        { label: "Built-up area", value: formatArea(unit.builtUpArea) },
        { label: "Configuration", value: formatBedrooms(unit.bedrooms ? [unit.bedrooms] : []) },
        { label: "Price", value: formatMoney(unit.price) },
      ];
  }
}

function toTitle(unit: InventoryUnit): string {
  switch (unit.kind) {
    case "plot":
      return unit.plotNumber;
    case "villa":
      return unit.villaNumber;
    default:
      return unit.unitNumber;
  }
}

export function toInventoryGroups(units: InventoryUnit[]): InventoryGroup[] {
  const order: Array<InventoryUnit["kind"]> = ["plot", "apartment", "villa", "commercial"];
  const groups: InventoryGroup[] = [];

  for (const kind of order) {
    const matching = units.filter((unit) => unit.kind === kind);
    if (matching.length === 0) continue;

    const rows: InventoryRow[] = matching.map((unit) => ({
      id: unit.id,
      title: toTitle(unit),
      status: unit.status,
      sample: unit.sample,
      cells: toCells(unit),
    }));

    groups.push({
      kind,
      heading: KIND_HEADING[kind],
      titleLabel: KIND_TITLE[kind],
      statusLabel: KIND_STATUS[kind],
      columns: rows[0].cells.map((cell) => cell.label),
      rows,
    });
  }

  return groups;
}

export const STATUS_TONE: Record<UnitStatus, "success" | "warning" | "danger"> = {
  available: "success",
  reserved: "warning",
  sold: "danger",
};
