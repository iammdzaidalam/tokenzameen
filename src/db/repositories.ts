import { and, count, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { getDb, type Database } from "./client";
import {
  advisors,
  analyticsEvents,
  inventoryUnits,
  leadEvents,
  leads,
  siteVisits,
  type Advisor,
  type AnalyticsEvent,
  type AnalyticsEventType,
  type InventoryKind,
  type InventoryUnitRow,
  type Lead,
  type LeadEvent,
  type LeadEventType,
  type LeadPurpose,
  type LeadSource,
  type LeadStage,
  type LeadStatus,
  type SiteVisit,
  type SiteVisitStatus,
} from "./schema";
import { generateReference, scoreLead } from "@/lib/leads";

export type RepoErrorCode = "no-database" | "not-found" | "conflict" | "query-failed";

export interface RepoError {
  code: RepoErrorCode;
  message: string;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: RepoError };

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

const NO_DATABASE: RepoError = {
  code: "no-database",
  message: "The database is not configured.",
};

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

function fail<T>(error: RepoError): Result<T> {
  return { ok: false, error };
}

function failed<T>(context: string, error: unknown): Result<T> {
  console.error(`[db] ${context}`, error);
  return fail({ code: "query-failed", message: "The database request failed." });
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

async function withDb<T>(context: string, run: (db: Database) => Promise<Result<T>>): Promise<Result<T>> {
  const db = getDb();
  if (!db) return fail(NO_DATABASE);
  try {
    return await run(db);
  } catch (error) {
    return failed(context, error);
  }
}

function clampPage(page: number | undefined): number {
  return Math.max(1, Math.floor(page ?? 1));
}

function clampPageSize(pageSize: number | undefined): number {
  return Math.min(100, Math.max(1, Math.floor(pageSize ?? 25)));
}

export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string | null;
  projectSlug?: string | null;
  categorySlug?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  purpose?: LeadPurpose | null;
  source: LeadSource;
  message?: string | null;
  preferredCallback?: string | null;
  consent: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  score?: number;
  stage?: LeadStage;
}

const REFERENCE_ATTEMPTS = 5;

export async function createLead(input: CreateLeadInput): Promise<Result<Lead>> {
  return withDb("createLead", async (db) => {
    for (let attempt = 0; attempt < REFERENCE_ATTEMPTS; attempt += 1) {
      try {
        const rows = await db
          .insert(leads)
          .values({
            reference: generateReference(),
            name: input.name,
            phone: input.phone,
            email: input.email ?? null,
            projectSlug: input.projectSlug ?? null,
            categorySlug: input.categorySlug ?? null,
            budgetMin: input.budgetMin ?? null,
            budgetMax: input.budgetMax ?? null,
            purpose: input.purpose ?? null,
            source: input.source,
            message: input.message ?? null,
            preferredCallback: input.preferredCallback ?? null,
            consent: input.consent,
            score: input.score ?? 0,
            stage: input.stage ?? "cold",
            utmSource: input.utmSource ?? null,
            utmMedium: input.utmMedium ?? null,
            utmCampaign: input.utmCampaign ?? null,
            utmTerm: input.utmTerm ?? null,
            utmContent: input.utmContent ?? null,
            ipHash: input.ipHash ?? null,
            userAgent: input.userAgent ?? null,
          })
          .returning();
        const row = rows[0];
        if (!row) return fail({ code: "query-failed", message: "The lead was not written." });
        return ok(row);
      } catch (error) {
        if (isUniqueViolation(error) && attempt < REFERENCE_ATTEMPTS - 1) continue;
        throw error;
      }
    }
    return fail({ code: "conflict", message: "Could not allocate a reference code." });
  });
}

export async function getLeadByReference(reference: string): Promise<Result<Lead>> {
  return withDb("getLeadByReference", async (db) => {
    const rows = await db.select().from(leads).where(eq(leads.reference, reference)).limit(1);
    const row = rows[0];
    if (!row) return fail({ code: "not-found", message: "No enquiry with that reference." });
    return ok(row);
  });
}

export async function getLeadById(id: string): Promise<Result<Lead>> {
  return withDb("getLeadById", async (db) => {
    const rows = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    const row = rows[0];
    if (!row) return fail({ code: "not-found", message: "No lead with that id." });
    return ok(row);
  });
}

export async function findLeadByPhone(phone: string): Promise<Result<Lead | null>> {
  return withDb("findLeadByPhone", async (db) => {
    const rows = await db
      .select()
      .from(leads)
      .where(eq(leads.phone, phone))
      .orderBy(desc(leads.createdAt))
      .limit(1);
    return ok(rows[0] ?? null);
  });
}

export interface ListLeadsFilter {
  status?: LeadStatus[];
  stage?: LeadStage[];
  source?: LeadSource[];
  projectSlug?: string;
  advisorId?: string;
  search?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}

export async function listLeads(filter: ListLeadsFilter = {}): Promise<Result<Page<Lead>>> {
  return withDb("listLeads", async (db) => {
    const conditions = [];
    if (filter.status?.length) conditions.push(inArray(leads.status, filter.status));
    if (filter.stage?.length) conditions.push(inArray(leads.stage, filter.stage));
    if (filter.source?.length) conditions.push(inArray(leads.source, filter.source));
    if (filter.projectSlug) conditions.push(eq(leads.projectSlug, filter.projectSlug));
    if (filter.advisorId) conditions.push(eq(leads.advisorId, filter.advisorId));
    if (filter.from) conditions.push(gte(leads.createdAt, filter.from));
    if (filter.to) conditions.push(lte(leads.createdAt, filter.to));
    if (filter.search) {
      const term = `%${filter.search}%`;
      const match = or(
        ilike(leads.name, term),
        ilike(leads.phone, term),
        ilike(leads.email, term),
        ilike(leads.reference, term),
      );
      if (match) conditions.push(match);
    }

    const where = conditions.length ? and(...conditions) : undefined;
    const page = clampPage(filter.page);
    const pageSize = clampPageSize(filter.pageSize);

    const items = await db
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const totals = await db.select({ value: count() }).from(leads).where(where);
    return ok({ items, total: totals[0]?.value ?? 0, page, pageSize });
  });
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  options?: { advisorId?: string | null; nextFollowUpAt?: Date | null; note?: string | null },
): Promise<Result<Lead>> {
  return withDb("updateLeadStatus", async (db) => {
    const now = new Date();
    const rows = await db
      .update(leads)
      .set({
        status,
        lastContactAt: now,
        updatedAt: now,
        ...(options && "advisorId" in options ? { advisorId: options.advisorId ?? null } : {}),
        ...(options && "nextFollowUpAt" in options
          ? { nextFollowUpAt: options.nextFollowUpAt ?? null }
          : {}),
      })
      .where(eq(leads.id, leadId))
      .returning();
    const row = rows[0];
    if (!row) return fail({ code: "not-found", message: "No lead with that id." });

    await db.insert(leadEvents).values({
      leadId,
      type: "status-change",
      payload: { status, note: options?.note ?? null },
    });

    return ok(row);
  });
}

export async function assignAdvisor(
  leadId: string,
  advisorId: string | null,
): Promise<Result<Lead>> {
  return withDb("assignAdvisor", async (db) => {
    const now = new Date();
    const rows = await db
      .update(leads)
      .set({ advisorId, updatedAt: now })
      .where(eq(leads.id, leadId))
      .returning();
    const row = rows[0];
    if (!row) return fail({ code: "not-found", message: "No lead with that id." });

    await db.insert(leadEvents).values({
      leadId,
      type: "advisor-assigned",
      payload: { advisorId },
    });

    return ok(row);
  });
}

export interface AppendLeadEventInput {
  leadId: string;
  type: LeadEventType;
  payload?: Record<string, unknown> | null;
}

export async function appendLeadEvent(input: AppendLeadEventInput): Promise<Result<LeadEvent>> {
  return withDb("appendLeadEvent", async (db) => {
    const rows = await db
      .insert(leadEvents)
      .values({ leadId: input.leadId, type: input.type, payload: input.payload ?? null })
      .returning();
    const row = rows[0];
    if (!row) return fail({ code: "query-failed", message: "The event was not written." });
    return ok(row);
  });
}

export async function listLeadEvents(leadId: string): Promise<Result<LeadEvent[]>> {
  return withDb("listLeadEvents", async (db) => {
    const rows = await db
      .select()
      .from(leadEvents)
      .where(eq(leadEvents.leadId, leadId))
      .orderBy(leadEvents.createdAt);
    return ok(rows);
  });
}

/**
 * Re-runs the rules engine over the lead's whole event history and persists the
 * result, so the score in the database is always explainable by the audit trail
 * rather than by the order calls happened to arrive in.
 */
export async function rescoreLead(leadId: string): Promise<Result<Lead>> {
  return withDb("rescoreLead", async (db) => {
    const leadRows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = leadRows[0];
    if (!lead) return fail({ code: "not-found", message: "No lead with that id." });

    const events = await db
      .select({ type: leadEvents.type, createdAt: leadEvents.createdAt })
      .from(leadEvents)
      .where(eq(leadEvents.leadId, leadId));

    const { score, stage } = scoreLead({
      events,
      profile: {
        email: lead.email,
        budgetMin: lead.budgetMin,
        budgetMax: lead.budgetMax,
        purpose: lead.purpose,
        projectSlug: lead.projectSlug,
        consent: lead.consent,
      },
    });

    const rows = await db
      .update(leads)
      .set({ score, stage, updatedAt: new Date() })
      .where(eq(leads.id, leadId))
      .returning();
    return ok(rows[0] ?? lead);
  });
}

export interface CreateSiteVisitInput {
  leadId: string;
  projectSlug?: string | null;
  preferredDate: string;
  preferredTime?: string | null;
  visitors?: number;
  notes?: string | null;
}

export async function createSiteVisit(input: CreateSiteVisitInput): Promise<Result<SiteVisit>> {
  return withDb("createSiteVisit", async (db) => {
    const rows = await db
      .insert(siteVisits)
      .values({
        leadId: input.leadId,
        projectSlug: input.projectSlug ?? null,
        preferredDate: input.preferredDate,
        preferredTime: input.preferredTime ?? null,
        visitors: input.visitors ?? 1,
        notes: input.notes ?? null,
      })
      .returning();
    const row = rows[0];
    if (!row) return fail({ code: "query-failed", message: "The site visit was not written." });
    return ok(row);
  });
}

export interface ListSiteVisitsFilter {
  status?: SiteVisitStatus[];
  projectSlug?: string;
  leadId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface SiteVisitWithLead {
  visit: SiteVisit;
  lead: Pick<Lead, "id" | "reference" | "name" | "phone" | "email" | "stage" | "status"> | null;
}

export async function listSiteVisits(
  filter: ListSiteVisitsFilter = {},
): Promise<Result<Page<SiteVisitWithLead>>> {
  return withDb("listSiteVisits", async (db) => {
    const conditions = [];
    if (filter.status?.length) conditions.push(inArray(siteVisits.status, filter.status));
    if (filter.projectSlug) conditions.push(eq(siteVisits.projectSlug, filter.projectSlug));
    if (filter.leadId) conditions.push(eq(siteVisits.leadId, filter.leadId));
    if (filter.from) conditions.push(gte(siteVisits.preferredDate, filter.from));
    if (filter.to) conditions.push(lte(siteVisits.preferredDate, filter.to));

    const where = conditions.length ? and(...conditions) : undefined;
    const page = clampPage(filter.page);
    const pageSize = clampPageSize(filter.pageSize);

    const rows = await db
      .select({
        visit: siteVisits,
        lead: {
          id: leads.id,
          reference: leads.reference,
          name: leads.name,
          phone: leads.phone,
          email: leads.email,
          stage: leads.stage,
          status: leads.status,
        },
      })
      .from(siteVisits)
      .leftJoin(leads, eq(siteVisits.leadId, leads.id))
      .where(where)
      .orderBy(desc(siteVisits.preferredDate), desc(siteVisits.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const totals = await db.select({ value: count() }).from(siteVisits).where(where);
    return ok({ items: rows, total: totals[0]?.value ?? 0, page, pageSize });
  });
}

export async function updateSiteVisitStatus(
  visitId: string,
  status: SiteVisitStatus,
  notes?: string | null,
): Promise<Result<SiteVisit>> {
  return withDb("updateSiteVisitStatus", async (db) => {
    const rows = await db
      .update(siteVisits)
      .set({
        status,
        updatedAt: new Date(),
        ...(notes === undefined ? {} : { notes: notes ?? null }),
      })
      .where(eq(siteVisits.id, visitId))
      .returning();
    const row = rows[0];
    if (!row) return fail({ code: "not-found", message: "No site visit with that id." });
    return ok(row);
  });
}

export interface ListInventoryFilter {
  projectSlug?: string;
  kind?: InventoryKind;
  status?: InventoryUnitRow["status"][];
  includeSample?: boolean;
}

export async function listInventory(
  filter: ListInventoryFilter = {},
): Promise<Result<InventoryUnitRow[]>> {
  return withDb("listInventory", async (db) => {
    const conditions = [];
    if (filter.projectSlug) conditions.push(eq(inventoryUnits.projectSlug, filter.projectSlug));
    if (filter.kind) conditions.push(eq(inventoryUnits.kind, filter.kind));
    if (filter.status?.length) conditions.push(inArray(inventoryUnits.status, filter.status));
    if (filter.includeSample === false) conditions.push(eq(inventoryUnits.isSample, false));

    const rows = await db
      .select()
      .from(inventoryUnits)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(inventoryUnits.projectSlug, inventoryUnits.unitNumber);
    return ok(rows);
  });
}

export interface UpsertInventoryUnitInput {
  projectSlug: string;
  kind: InventoryKind;
  unitNumber: string;
  tower?: string | null;
  floor?: number | null;
  bedrooms?: InventoryUnitRow["bedrooms"];
  areaMin?: number | null;
  areaMax?: number | null;
  areaUnit?: InventoryUnitRow["areaUnit"];
  facing?: string | null;
  roadWidthFt?: number | null;
  priceAmount?: number | null;
  monthlyRentAmount?: number | null;
  leaseStatus?: string | null;
  tenant?: string | null;
  status?: InventoryUnitRow["status"];
  isSample?: boolean;
  planX?: number | null;
  planY?: number | null;
  planW?: number | null;
  planH?: number | null;
}

/** Keyed on (projectSlug, unitNumber), which is what makes the seed idempotent. */
export async function upsertInventoryUnit(
  input: UpsertInventoryUnitInput,
): Promise<Result<InventoryUnitRow>> {
  return withDb("upsertInventoryUnit", async (db) => {
    const values = {
      projectSlug: input.projectSlug,
      kind: input.kind,
      unitNumber: input.unitNumber,
      tower: input.tower ?? null,
      floor: input.floor ?? null,
      bedrooms: input.bedrooms ?? null,
      areaMin: input.areaMin ?? null,
      areaMax: input.areaMax ?? null,
      areaUnit: input.areaUnit ?? null,
      facing: input.facing ?? null,
      roadWidthFt: input.roadWidthFt ?? null,
      priceAmount: input.priceAmount ?? null,
      monthlyRentAmount: input.monthlyRentAmount ?? null,
      leaseStatus: input.leaseStatus ?? null,
      tenant: input.tenant ?? null,
      status: input.status ?? "available",
      isSample: input.isSample ?? false,
      planX: input.planX ?? null,
      planY: input.planY ?? null,
      planW: input.planW ?? null,
      planH: input.planH ?? null,
    };

    const rows = await db
      .insert(inventoryUnits)
      .values(values)
      .onConflictDoUpdate({
        target: [inventoryUnits.projectSlug, inventoryUnits.unitNumber],
        set: { ...values, updatedAt: new Date() },
      })
      .returning();
    const row = rows[0];
    if (!row) return fail({ code: "query-failed", message: "The unit was not written." });
    return ok(row);
  });
}

export async function deleteInventoryUnit(id: string): Promise<Result<true>> {
  return withDb("deleteInventoryUnit", async (db) => {
    const rows = await db.delete(inventoryUnits).where(eq(inventoryUnits.id, id)).returning();
    if (rows.length === 0) return fail({ code: "not-found", message: "No unit with that id." });
    return ok(true);
  });
}

export interface RecordAnalyticsEventInput {
  type: AnalyticsEventType;
  projectSlug?: string | null;
  categorySlug?: string | null;
  payload?: Record<string, unknown> | null;
  sessionHash?: string | null;
}

export async function recordAnalyticsEvent(
  input: RecordAnalyticsEventInput,
): Promise<Result<AnalyticsEvent>> {
  return withDb("recordAnalyticsEvent", async (db) => {
    const rows = await db
      .insert(analyticsEvents)
      .values({
        type: input.type,
        projectSlug: input.projectSlug ?? null,
        categorySlug: input.categorySlug ?? null,
        payload: input.payload ?? null,
        sessionHash: input.sessionHash ?? null,
      })
      .returning();
    const row = rows[0];
    if (!row) return fail({ code: "query-failed", message: "The event was not written." });
    return ok(row);
  });
}

export interface AnalyticsSummary {
  from: string;
  to: string;
  events: Array<{ type: AnalyticsEventType; count: number }>;
  totals: { events: number; leads: number; siteVisits: number; purchased: number };
  /** Ratios in 0–1, or null when the denominator is zero. PRD 01 §41. */
  rates: {
    enquiryConversion: number | null;
    leadToSiteVisit: number | null;
    siteVisitToPurchase: number | null;
  };
  topProjects: Array<{ projectSlug: string; views: number }>;
}

function ratio(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

export async function getAnalyticsSummary(
  range: { from?: Date; to?: Date } = {},
): Promise<Result<AnalyticsSummary>> {
  return withDb("getAnalyticsSummary", async (db) => {
    const to = range.to ?? new Date();
    const from = range.from ?? new Date(to.getTime() - 30 * 86_400_000);

    const eventWindow = and(
      gte(analyticsEvents.createdAt, from),
      lte(analyticsEvents.createdAt, to),
    );
    const leadWindow = and(gte(leads.createdAt, from), lte(leads.createdAt, to));
    const visitWindow = and(gte(siteVisits.createdAt, from), lte(siteVisits.createdAt, to));

    const byType = await db
      .select({ type: analyticsEvents.type, value: count() })
      .from(analyticsEvents)
      .where(eventWindow)
      .groupBy(analyticsEvents.type);

    const topProjects = await db
      .select({ projectSlug: analyticsEvents.projectSlug, value: count() })
      .from(analyticsEvents)
      .where(and(eventWindow, eq(analyticsEvents.type, "property-view")))
      .groupBy(analyticsEvents.projectSlug)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const leadTotals = await db.select({ value: count() }).from(leads).where(leadWindow);
    const visitTotals = await db.select({ value: count() }).from(siteVisits).where(visitWindow);
    const purchasedTotals = await db
      .select({ value: count() })
      .from(leads)
      .where(and(leadWindow, eq(leads.status, "purchased")));

    const events = byType.map((row) => ({ type: row.type, count: row.value }));
    const totalEvents = events.reduce((sum, row) => sum + row.count, 0);
    const pageViews = events.find((row) => row.type === "page-view")?.count ?? 0;
    const leadCount = leadTotals[0]?.value ?? 0;
    const visitCount = visitTotals[0]?.value ?? 0;
    const purchasedCount = purchasedTotals[0]?.value ?? 0;

    return ok({
      from: from.toISOString(),
      to: to.toISOString(),
      events,
      totals: {
        events: totalEvents,
        leads: leadCount,
        siteVisits: visitCount,
        purchased: purchasedCount,
      },
      rates: {
        enquiryConversion: ratio(leadCount, pageViews),
        leadToSiteVisit: ratio(visitCount, leadCount),
        siteVisitToPurchase: ratio(purchasedCount, visitCount),
      },
      topProjects: topProjects
        .filter((row): row is { projectSlug: string; value: number } => row.projectSlug !== null)
        .map((row) => ({ projectSlug: row.projectSlug, views: row.value })),
    });
  });
}

export async function listAdvisors(options?: { activeOnly?: boolean }): Promise<Result<Advisor[]>> {
  return withDb("listAdvisors", async (db) => {
    const rows = await db
      .select()
      .from(advisors)
      .where(options?.activeOnly ? eq(advisors.active, true) : undefined)
      .orderBy(advisors.name);
    return ok(rows);
  });
}

export async function upsertAdvisor(input: {
  name: string;
  email: string;
  phone?: string | null;
  active?: boolean;
}): Promise<Result<Advisor>> {
  return withDb("upsertAdvisor", async (db) => {
    const rows = await db
      .insert(advisors)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        active: input.active ?? true,
      })
      .onConflictDoUpdate({
        target: advisors.email,
        set: { name: input.name, phone: input.phone ?? null, active: input.active ?? true },
      })
      .returning();
    const row = rows[0];
    if (!row) return fail({ code: "query-failed", message: "The advisor was not written." });
    return ok(row);
  });
}
