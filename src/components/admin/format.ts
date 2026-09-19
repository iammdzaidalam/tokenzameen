import type { LeadEventType } from "@/db/schema";
import { formatAmount } from "@/lib/format";

const INDIA_TIME_ZONE = "Asia/Kolkata";

const dateTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: INDIA_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dateOnly = new Intl.DateTimeFormat("en-IN", {
  timeZone: INDIA_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const isoDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: INDIA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Timestamps are shown in IST because that is where the team works. */
export function formatDateTime(value: Date | string | null | undefined, fallback = "—"): string {
  const date = toDate(value);
  return date ? `${dateTime.format(date)} IST` : fallback;
}

export function formatDay(value: Date | string | null | undefined, fallback = "—"): string {
  const date = toDate(value);
  return date ? dateOnly.format(date) : fallback;
}

/** A `date` column arrives as `YYYY-MM-DD`; it is a calendar day, not an instant. */
export function formatCalendarDay(iso: string, fallback = "—"): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function toDateInputValue(value: Date | string | null | undefined): string {
  const date = toDate(value);
  return date ? isoDay.format(date) : "";
}

/** A follow-up date from the form is a calendar day in IST; it is stored as the start of that day. */
export function dateInputToInstant(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatBudget(min: number | null, max: number | null): string {
  if (min === null && max === null) return "On request";
  if (min === null && max !== null) return `Under ${formatAmount(max)}`;
  if (min !== null && max === null) return `Above ${formatAmount(min)}`;
  return `${formatAmount(min ?? 0)} – ${formatAmount(max ?? 0)}`;
}

export function formatRupees(amount: number | null): string {
  return amount === null ? "On request" : formatAmount(amount);
}

export function formatRate(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export const LEAD_EVENT_LABEL: Record<LeadEventType, string> = {
  created: "Lead created",
  "property-view": "Viewed a property",
  save: "Saved a property",
  compare: "Compared properties",
  "brochure-download": "Downloaded a brochure",
  "document-request": "Requested a document",
  "request-price": "Requested a price",
  enquiry: "Sent an enquiry",
  callback: "Asked for a callback",
  whatsapp: "Opened WhatsApp",
  call: "Called",
  "site-visit-request": "Requested a site visit",
  "site-visit-completed": "Completed a site visit",
  "purchase-intent": "Expressed purchase intent",
  advisory: "Asked for advisory",
  "status-change": "Status changed",
  "advisor-assigned": "Advisor assigned",
  note: "Note",
};

export function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function pageParam(value: string | string[] | undefined): number {
  const raw = Number.parseInt(firstParam(value) ?? "1", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

export function pickParam<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | null {
  const raw = firstParam(value);
  if (!raw) return null;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

/** `?stage=hot,purchase-ready` selects both; unknown values are dropped rather than erroring. */
export function pickParams<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T[] {
  const raw = firstParam(value);
  if (!raw) return [];
  const seen = new Set<T>();
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if ((allowed as readonly string[]).includes(trimmed)) seen.add(trimmed as T);
  }
  return [...seen];
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
