import { z } from "zod";
import type { LeadPurpose, LeadSource } from "@/db/schema";
import type { AnalyticsEventType } from "@/db/schema";
import type { CategorySlug } from "@/types/catalog";

/**
 * Type-only imports keep `@/db/schema` (and drizzle) out of the client bundle
 * while `satisfies` still fails the build if a tuple drifts from the database
 * enum it mirrors.
 */
export const LEAD_SOURCE_VALUES = [
  "property-enquiry",
  "site-visit",
  "request-price",
  "brochure-download",
  "investment-enquiry",
  "callback",
  "whatsapp",
  "purchase-intent",
  "advisory",
  "document-access",
] as const satisfies readonly LeadSource[];

export const PURPOSE_VALUES = [
  "self-use",
  "investment",
  "second-home",
  "rental-income",
  "capital-appreciation",
  "commercial-income",
  "land-banking",
] as const satisfies readonly LeadPurpose[];

export const CATEGORY_SLUG_VALUES = [
  "apartments",
  "villas",
  "commercial",
  "sustainable-living",
  "spiritual-residences",
  "plots",
] as const satisfies readonly CategorySlug[];

export const ANALYTICS_EVENT_VALUES = [
  "page-view",
  "property-view",
  "category-view",
  "search",
  "filter-use",
  "save",
  "compare",
  "brochure-download",
  "enquiry",
  "call",
  "whatsapp",
  "site-visit-request",
  "purchase-request",
] as const satisfies readonly AnalyticsEventType[];

export const CALLBACK_WINDOW_VALUES = ["morning", "afternoon", "evening", "anytime"] as const;
export type CallbackWindow = (typeof CALLBACK_WINDOW_VALUES)[number];
export const CALLBACK_WINDOW_LABEL: Record<CallbackWindow, string> = {
  morning: "Morning (9am – 12pm)",
  afternoon: "Afternoon (12pm – 4pm)",
  evening: "Evening (4pm – 8pm)",
  anytime: "Anytime",
};

export const VISIT_SLOT_VALUES = [
  "09:00-11:00",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-17:00",
  "17:00-19:00",
] as const;
export type VisitSlot = (typeof VISIT_SLOT_VALUES)[number];
export const VISIT_SLOT_LABEL: Record<VisitSlot, string> = {
  "09:00-11:00": "9:00 – 11:00 am",
  "11:00-13:00": "11:00 am – 1:00 pm",
  "13:00-15:00": "1:00 – 3:00 pm",
  "15:00-17:00": "3:00 – 5:00 pm",
  "17:00-19:00": "5:00 – 7:00 pm",
};

export const TIMELINE_VALUES = [
  "immediate",
  "1-3-months",
  "3-6-months",
  "6-12-months",
  "exploring",
] as const;
export type Timeline = (typeof TIMELINE_VALUES)[number];
export const TIMELINE_LABEL: Record<Timeline, string> = {
  immediate: "Immediately",
  "1-3-months": "In 1 – 3 months",
  "3-6-months": "In 3 – 6 months",
  "6-12-months": "In 6 – 12 months",
  exploring: "Still exploring",
};

export const BUDGET_BAND_VALUES = [
  "under-50-lakh",
  "50-lakh-1-crore",
  "1-2-crore",
  "2-5-crore",
  "5-10-crore",
  "above-10-crore",
] as const;
export type BudgetBand = (typeof BUDGET_BAND_VALUES)[number];

/** Bounds are whole rupees, the money unit used everywhere else. See docs/DATA.md. */
export const BUDGET_BANDS: Record<
  BudgetBand,
  { label: string; min: number | null; max: number | null }
> = {
  "under-50-lakh": { label: "Under ₹50 Lakh", min: null, max: 5_000_000 },
  "50-lakh-1-crore": { label: "₹50 Lakh – ₹1 Crore", min: 5_000_000, max: 10_000_000 },
  "1-2-crore": { label: "₹1 – 2 Crore", min: 10_000_000, max: 20_000_000 },
  "2-5-crore": { label: "₹2 – 5 Crore", min: 20_000_000, max: 50_000_000 },
  "5-10-crore": { label: "₹5 – 10 Crore", min: 50_000_000, max: 100_000_000 },
  "above-10-crore": { label: "Above ₹10 Crore", min: 100_000_000, max: null },
};

export function resolveBudgetBand(band: BudgetBand | null | undefined): {
  min: number | null;
  max: number | null;
} {
  if (!band) return { min: null, max: null };
  const match = BUDGET_BANDS[band];
  return { min: match?.min ?? null, max: match?.max ?? null };
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Empty strings are how an unselected `<select>` and an untouched text input
 * arrive from the browser. They mean "not answered", not "invalid".
 */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .union([z.literal(""), z.enum(values)])
    .nullable()
    .optional()
    .transform((value) => (value ? value : null));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional()
    .transform((value) => value ?? null);

export const slugSchema = z
  .union([z.literal(""), z.string().trim().max(80).regex(SLUG_PATTERN, "Not a valid identifier")])
  .nullable()
  .optional()
  .transform((value) => (value ? value : null));

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your full name")
  .max(80, "That name is too long")
  .regex(/^[\p{L}\p{M}'‘’.\- ]+$/u, "Please use letters only")
  .transform((value) => value.replace(/[‘’]/g, "'"));

/**
 * Accepts +91 / 91 / 0 prefixes and a bare 10-digit number, and normalises to
 * E.164. Indian mobile numbers start 6–9; landlines are not accepted because
 * every downstream channel (callback, WhatsApp) assumes a mobile.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .transform((value) => value.replace(/[\s()\-.]/g, ""))
  .refine((value) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(value), "Enter a valid 10-digit Indian mobile number")
  .transform((value) => `+91${value.slice(-10)}`);

export const emailSchema = z.email("Enter a valid email address").trim().max(160);

export const optionalEmailSchema = z
  .union([z.literal(""), emailSchema])
  .optional()
  .transform((value) => (value ? value : null));

export const messageSchema = z
  .string()
  .trim()
  .max(1000, "Please keep this under 1000 characters")
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null));

export const consentSchema = z
  .boolean()
  .refine((value) => value === true, "Please agree to be contacted so an advisor can reach you");

/** Hidden from real users by the form; anything in it is a bot. */
export const honeypotSchema = z
  .string()
  .max(0, "Rejected")
  .optional()
  .transform((value) => value ?? "");

export const startedAtSchema = z.number().int().positive();

export const utmSchema = z
  .object({
    source: optionalText(120),
    medium: optionalText(120),
    campaign: optionalText(120),
    term: optionalText(120),
    content: optionalText(120),
  })
  .optional()
  .transform(
    (value) =>
      value ?? { source: null, medium: null, campaign: null, term: null, content: null },
  );

const INDIA_TIME_ZONE = "Asia/Kolkata";

/**
 * Site visits are booked against Indian calendar days, and the server runs in
 * UTC. Comparing ISO date strings in IST keeps a same-day evening request from
 * being rejected as "in the past".
 */
export function todayInIndia(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts;
}

export function addDaysToIsoDate(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const MAX_VISIT_LEAD_DAYS = 180;

export const visitDateSchema = z
  .iso
  .date("Choose a date")
  .refine((value) => value >= todayInIndia(), "Choose today or a later date")
  .refine(
    (value) => value <= addDaysToIsoDate(todayInIndia(), MAX_VISIT_LEAD_DAYS),
    "Please choose a date within the next six months",
  );

export const contactFields = {
  name: nameSchema,
  phone: phoneSchema,
  website: honeypotSchema,
  startedAt: startedAtSchema,
  utm: utmSchema,
};

/**
 * One requirement shape behind every CTA. `location` and `timeline` have no
 * column on `leads`; they are carried into the lead event payload so nothing a
 * buyer typed is dropped on the floor.
 */
const requirementFields = {
  ...contactFields,
  email: optionalEmailSchema,
  projectSlug: slugSchema,
  categorySlug: optionalEnum(CATEGORY_SLUG_VALUES),
  budgetBand: optionalEnum(BUDGET_BAND_VALUES),
  purpose: optionalEnum(PURPOSE_VALUES),
  location: optionalText(120),
  timeline: optionalEnum(TIMELINE_VALUES),
  preferredCallback: optionalEnum(CALLBACK_WINDOW_VALUES),
  message: messageSchema,
  consent: consentSchema,
};

export const enquirySchema = z.object({
  ...requirementFields,
  source: z.enum(LEAD_SOURCE_VALUES).default("property-enquiry"),
});

export const siteVisitSchema = z.object({
  ...contactFields,
  email: optionalEmailSchema,
  projectSlug: slugSchema,
  preferredDate: visitDateSchema,
  preferredTime: optionalEnum(VISIT_SLOT_VALUES),
  visitors: z.coerce
    .number()
    .int("Enter a whole number")
    .min(1, "At least one visitor")
    .max(10, "For groups above ten, please call us")
    .default(1),
  message: messageSchema,
  consent: consentSchema,
});

/** Validated by `POST /api/leads` through `enquirySchema`; only the default source differs. */
export const advisorySchema = z.object({
  ...requirementFields,
  source: z.enum(LEAD_SOURCE_VALUES).default("advisory"),
});

export const documentRequestSchema = z.object({
  ...contactFields,
  email: emailSchema,
  projectSlug: z.string().trim().min(1, "Missing property").max(80).regex(SLUG_PATTERN),
  documentId: z.string().trim().min(1, "Missing document").max(120),
  documentTitle: optionalText(160),
  consent: consentSchema,
});

export const callbackSchema = z.object({
  ...contactFields,
  projectSlug: slugSchema,
  preferredCallback: optionalEnum(CALLBACK_WINDOW_VALUES),
  source: z.enum(LEAD_SOURCE_VALUES).default("callback"),
  consent: consentSchema,
});

export const analyticsEventSchema = z.object({
  type: z.enum(ANALYTICS_EVENT_VALUES),
  projectSlug: slugSchema,
  categorySlug: optionalEnum(CATEGORY_SLUG_VALUES),
  sessionId: z.string().trim().max(64).nullable().optional().transform((v) => v ?? null),
  payload: z
    .record(z.string(), z.unknown())
    .nullable()
    .optional()
    .transform((v) => v ?? null)
    .refine(
      (v) => v === null || JSON.stringify(v).length <= 2000,
      "Payload is too large",
    ),
});

export const referenceSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^TZ-[0-9A-Z]{6}$/, "Not a valid reference code");

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;
export type SiteVisitInput = z.input<typeof siteVisitSchema>;
export type SiteVisitValues = z.output<typeof siteVisitSchema>;
export type AdvisoryInput = z.input<typeof advisorySchema>;
export type AdvisoryValues = z.output<typeof advisorySchema>;
export type DocumentRequestInput = z.input<typeof documentRequestSchema>;
export type DocumentRequestValues = z.output<typeof documentRequestSchema>;
export type CallbackInput = z.input<typeof callbackSchema>;
export type CallbackValues = z.output<typeof callbackSchema>;
export type AnalyticsEventInput = z.input<typeof analyticsEventSchema>;
export type AnalyticsEventValues = z.output<typeof analyticsEventSchema>;

/**
 * The wire contract between the forms and the route handlers. There is no
 * ambiguous shape: either a reference code came back, or the submission failed
 * and the UI owes the buyer the advisor's contact details.
 */
export type ApiErrorCode =
  | "invalid"
  | "rate-limited"
  | "unavailable"
  | "not-found"
  | "rejected"
  | "unknown";

export interface ApiFailure {
  ok: false;
  error: ApiErrorCode;
  message: string;
  fields?: Record<string, string>;
  retryAfterSeconds?: number;
}

export interface LeadSuccess {
  ok: true;
  reference: string;
}

export type LeadResponse = LeadSuccess | ApiFailure;

export interface LeadStatusSuccess {
  ok: true;
  reference: string;
  status: string;
  statusLabel: string;
  projectSlug: string | null;
  createdAt: string;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
}

export type LeadStatusResponse = LeadStatusSuccess | ApiFailure;

export const MIN_FILL_MS = 1_200;
const MAX_FILL_MS = 6 * 60 * 60 * 1_000;

/**
 * Server-side only. The client never surfaces these as field errors: a human
 * who somehow trips them gets the ordinary failure path with advisor contacts,
 * not a hidden field they cannot see or fix.
 */
export function looksAutomated(input: {
  website?: string;
  startedAt?: number;
  now?: number;
}): boolean {
  // Every real form stamps startedAt on mount, so its absence is itself a signal.
  if (input.website && input.website.length > 0) return true;
  if (typeof input.startedAt !== "number" || input.startedAt <= 0) return true;
  const elapsed = (input.now ?? Date.now()) - input.startedAt;
  if (elapsed < 0) return true;
  return elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS;
}

export function firstIssueMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue?.message ?? "Please check the details and try again.";
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (key && !(key in out)) out[key] = issue.message;
  }
  return out;
}
