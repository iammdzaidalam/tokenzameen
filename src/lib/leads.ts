import type { LeadEventType, LeadPurpose, LeadSource, LeadStage, LeadStatus } from "@/db/schema";

export const LEAD_STAGE_LABEL: Record<LeadStage, string> = {
  cold: "Cold",
  warm: "Warm",
  hot: "Hot",
  "purchase-ready": "Purchase Ready",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  "site-visit": "Site Visit",
  negotiation: "Negotiation",
  booking: "Booking",
  purchased: "Purchased",
  lost: "Lost",
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  "property-enquiry": "Property Enquiry",
  "site-visit": "Site Visit",
  "request-price": "Request Price",
  "brochure-download": "Brochure Download",
  "investment-enquiry": "Investment Enquiry",
  callback: "Callback Request",
  whatsapp: "WhatsApp",
  "purchase-intent": "Purchase Intent",
  advisory: "Advisory",
  "document-access": "Document Access",
};

/**
 * PRD 01 §32's ladder, as a rules engine. Nothing here is learned or inferred:
 * every number is a decision the team can change in one place. First occurrence
 * of an event scores `first`; each later occurrence scores `repeat`, and the
 * event's total contribution is capped at `cap`.
 */
export const EVENT_WEIGHTS: Record<LeadEventType, { first: number; repeat: number; cap: number }> = {
  created: { first: 2, repeat: 0, cap: 2 },
  "property-view": { first: 4, repeat: 1, cap: 8 },
  save: { first: 8, repeat: 2, cap: 12 },
  compare: { first: 6, repeat: 1, cap: 8 },
  "brochure-download": { first: 10, repeat: 2, cap: 14 },
  "document-request": { first: 10, repeat: 2, cap: 14 },
  "request-price": { first: 14, repeat: 3, cap: 20 },
  enquiry: { first: 12, repeat: 3, cap: 18 },
  callback: { first: 8, repeat: 2, cap: 12 },
  whatsapp: { first: 6, repeat: 1, cap: 8 },
  call: { first: 8, repeat: 2, cap: 12 },
  "site-visit-request": { first: 20, repeat: 4, cap: 28 },
  "site-visit-completed": { first: 26, repeat: 4, cap: 34 },
  "purchase-intent": { first: 30, repeat: 0, cap: 30 },
  advisory: { first: 10, repeat: 2, cap: 14 },
  "status-change": { first: 0, repeat: 0, cap: 0 },
  "advisor-assigned": { first: 0, repeat: 0, cap: 0 },
  note: { first: 0, repeat: 0, cap: 0 },
};

export const PROFILE_WEIGHTS = {
  email: 4,
  budget: 6,
  purpose: 4,
  project: 4,
  consent: 2,
} as const;

/** Older interest is weaker interest. Applied to each event by its age in days. */
export const RECENCY_DECAY = [
  { withinDays: 14, multiplier: 1 },
  { withinDays: 45, multiplier: 0.75 },
  { withinDays: 90, multiplier: 0.5 },
  { withinDays: Number.POSITIVE_INFINITY, multiplier: 0.25 },
] as const;

export const STAGE_THRESHOLDS: ReadonlyArray<{ stage: LeadStage; min: number }> = [
  { stage: "purchase-ready", min: 75 },
  { stage: "hot", min: 50 },
  { stage: "warm", min: 25 },
  { stage: "cold", min: 0 },
];

/**
 * The PRD's ladder is a promise to the sales team: someone who asked for a site
 * visit is never shown as cold because arithmetic said so. These floors hold the
 * ladder true regardless of the score.
 */
const STAGE_FLOORS: ReadonlyArray<{ type: LeadEventType; stage: LeadStage }> = [
  { type: "purchase-intent", stage: "purchase-ready" },
  { type: "site-visit-completed", stage: "purchase-ready" },
  { type: "site-visit-request", stage: "hot" },
  { type: "request-price", stage: "hot" },
  { type: "document-request", stage: "warm" },
  { type: "brochure-download", stage: "warm" },
  { type: "save", stage: "warm" },
  { type: "enquiry", stage: "warm" },
  { type: "advisory", stage: "warm" },
];

const STAGE_ORDER: Record<LeadStage, number> = {
  cold: 0,
  warm: 1,
  hot: 2,
  "purchase-ready": 3,
};

/** A lead's own source is its first rung on the ladder. */
export const SOURCE_EVENT: Record<LeadSource, LeadEventType> = {
  "property-enquiry": "enquiry",
  "site-visit": "site-visit-request",
  "request-price": "request-price",
  "brochure-download": "brochure-download",
  "investment-enquiry": "enquiry",
  callback: "callback",
  whatsapp: "whatsapp",
  "purchase-intent": "purchase-intent",
  advisory: "advisory",
  "document-access": "document-request",
};

export const MAX_SCORE = 100;

export interface ScoreEvent {
  type: LeadEventType;
  createdAt: Date | string;
}

export interface ScoreProfile {
  email?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  purpose?: LeadPurpose | null;
  projectSlug?: string | null;
  consent?: boolean | null;
}

export interface ScoreBreakdownEntry {
  label: string;
  points: number;
}

export interface ScoreResult {
  score: number;
  stage: LeadStage;
  breakdown: ScoreBreakdownEntry[];
}

function toTime(value: Date | string): number {
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(time) ? time : Number.NaN;
}

function decayFor(ageDays: number): number {
  for (const band of RECENCY_DECAY) {
    if (ageDays <= band.withinDays) return band.multiplier;
  }
  return RECENCY_DECAY[RECENCY_DECAY.length - 1].multiplier;
}

export function stageForScore(score: number): LeadStage {
  for (const threshold of STAGE_THRESHOLDS) {
    if (score >= threshold.min) return threshold.stage;
  }
  return "cold";
}

/**
 * Pure: the same events and profile always produce the same score. `now` is an
 * argument so recency is testable.
 */
export function scoreLead(input: {
  events: readonly ScoreEvent[];
  profile?: ScoreProfile;
  now?: Date;
}): ScoreResult {
  const now = input.now ?? new Date();
  const nowTime = now.getTime();
  const breakdown: ScoreBreakdownEntry[] = [];

  const ordered = [...input.events]
    .filter((event) => event.type in EVENT_WEIGHTS)
    .sort((a, b) => {
      const left = toTime(a.createdAt);
      const right = toTime(b.createdAt);
      if (!Number.isFinite(left) || !Number.isFinite(right)) return 0;
      return left - right;
    });

  const seen = new Map<LeadEventType, number>();
  const totals = new Map<LeadEventType, number>();

  for (const event of ordered) {
    const weight = EVENT_WEIGHTS[event.type];
    if (weight.cap === 0) continue;
    const occurrence = (seen.get(event.type) ?? 0) + 1;
    seen.set(event.type, occurrence);

    const base = occurrence === 1 ? weight.first : weight.repeat;
    if (base === 0) continue;

    const time = toTime(event.createdAt);
    const ageDays = Number.isFinite(time) ? Math.max(0, (nowTime - time) / 86_400_000) : 0;
    const earned = base * decayFor(ageDays);

    const running = totals.get(event.type) ?? 0;
    const allowed = Math.max(0, Math.min(earned, weight.cap - running));
    if (allowed <= 0) continue;
    totals.set(event.type, running + allowed);
  }

  let score = 0;
  for (const [type, points] of totals) {
    const rounded = Math.round(points);
    if (rounded <= 0) continue;
    score += rounded;
    breakdown.push({ label: type, points: rounded });
  }

  const profile = input.profile ?? {};
  if (profile.email) {
    score += PROFILE_WEIGHTS.email;
    breakdown.push({ label: "email-given", points: PROFILE_WEIGHTS.email });
  }
  if (typeof profile.budgetMin === "number" || typeof profile.budgetMax === "number") {
    score += PROFILE_WEIGHTS.budget;
    breakdown.push({ label: "budget-given", points: PROFILE_WEIGHTS.budget });
  }
  if (profile.purpose) {
    score += PROFILE_WEIGHTS.purpose;
    breakdown.push({ label: "purpose-given", points: PROFILE_WEIGHTS.purpose });
  }
  if (profile.projectSlug) {
    score += PROFILE_WEIGHTS.project;
    breakdown.push({ label: "property-named", points: PROFILE_WEIGHTS.project });
  }
  if (profile.consent) {
    score += PROFILE_WEIGHTS.consent;
    breakdown.push({ label: "consent-given", points: PROFILE_WEIGHTS.consent });
  }

  score = Math.max(0, Math.min(MAX_SCORE, Math.round(score)));

  let stage = stageForScore(score);
  for (const floor of STAGE_FLOORS) {
    if (!seen.has(floor.type)) continue;
    if (STAGE_ORDER[floor.stage] > STAGE_ORDER[stage]) stage = floor.stage;
  }

  return { score, stage, breakdown };
}

const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** `TZ-7F3K2A`. Ambiguous glyphs are excluded so it survives being read aloud. */
export function generateReference(): string {
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  let code = "";
  for (const byte of bytes) code += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `TZ-${code}`;
}

/**
 * The last line of defence when the database is unreachable. The enquiry is
 * written to the platform's error log in full so it can be recovered by hand;
 * the caller must still report failure to the buyer.
 */
export function logUnrecordedLead(context: string, payload: unknown, error?: unknown): void {
  console.error(
    `[lead:UNRECORDED] ${context} — this enquiry was NOT persisted and must be recovered manually`,
    JSON.stringify({ at: new Date().toISOString(), payload }, null, 2),
    error instanceof Error ? `${error.name}: ${error.message}` : error,
  );
}
