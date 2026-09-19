import type { Area, AreaUnit, BedroomConfig, Money } from "@/types/catalog";

const CRORE = 10_000_000;
const LAKH = 100_000;

const inGrouping = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function trimDecimal(value: number, places: number) {
  const fixed = value.toFixed(places);
  return fixed.replace(/\.?0+$/, "");
}

export function formatMoney(money: Money | null, fallback = "On request"): string {
  if (!money) return fallback;
  return formatAmount(money.amount);
}

export function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) return "On request";
  if (amount >= CRORE) return `₹${trimDecimal(amount / CRORE, 2)} Cr`;
  if (amount >= LAKH) return `₹${trimDecimal(amount / LAKH, 2)} Lakh`;
  return `₹${inGrouping.format(Math.round(amount))}`;
}

export function formatMoneyExact(money: Money | null, fallback = "On request"): string {
  if (!money) return fallback;
  return `₹${inGrouping.format(Math.round(money.amount))}`;
}

export function formatPriceFrom(money: Money | null): string {
  if (!money) return "Price on request";
  return `${formatAmount(money.amount)} onwards`;
}

const AREA_UNIT_LABEL: Record<AreaUnit, string> = {
  sqft: "sq. ft.",
  sqyd: "sq. yd.",
  acre: "acre",
};

export function formatArea(area: Area | null, fallback = "On request"): string {
  if (!area) return fallback;
  const unit = AREA_UNIT_LABEL[area.unit];
  const min = inGrouping.format(area.min);
  if (area.max === null || area.max === area.min) return `${min} ${unit}`;
  return `${min}–${inGrouping.format(area.max)} ${unit}`;
}

const BEDROOM_LABEL: Record<BedroomConfig, string> = {
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
  "4bhk": "4 BHK",
  "5plus": "5+ BHK",
};

export function formatBedrooms(configs: BedroomConfig[], fallback = "On request"): string {
  if (configs.length === 0) return fallback;
  return configs.map((c) => BEDROOM_LABEL[c]).join(", ");
}

export function bedroomLabel(config: BedroomConfig): string {
  return BEDROOM_LABEL[config];
}

export function formatPercent(value: number | null, fallback = "On request"): string {
  if (value === null || !Number.isFinite(value)) return fallback;
  return `${trimDecimal(value, 2)}%`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

/** Parses "2.5 cr", "45 lakh", "₹90,00,000" into rupees. Returns null when unparseable. */
export function parseBudgetInput(raw: string): number | null {
  const text = raw.trim().toLowerCase().replace(/[₹,\s]/g, "");
  if (!text) return null;
  const match = text.match(/^(\d+(?:\.\d+)?)(cr|crore|crores|l|lac|lakh|lakhs|k)?$/);
  if (!match) return null;
  const value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value)) return null;
  switch (match[2]) {
    case "cr":
    case "crore":
    case "crores":
      return value * CRORE;
    case "l":
    case "lac":
    case "lakh":
    case "lakhs":
      return value * LAKH;
    case "k":
      return value * 1000;
    default:
      return value;
  }
}
