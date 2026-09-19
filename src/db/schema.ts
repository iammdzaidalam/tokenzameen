import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const LEAD_SOURCES = [
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
] as const;

export const LEAD_STAGES = ["cold", "warm", "hot", "purchase-ready"] as const;

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "site-visit",
  "negotiation",
  "booking",
  "purchased",
  "lost",
] as const;

export const LEAD_PURPOSES = [
  "self-use",
  "investment",
  "second-home",
  "rental-income",
  "capital-appreciation",
  "commercial-income",
  "land-banking",
] as const;

export const LEAD_EVENT_TYPES = [
  "created",
  "property-view",
  "save",
  "compare",
  "brochure-download",
  "document-request",
  "request-price",
  "enquiry",
  "callback",
  "whatsapp",
  "call",
  "site-visit-request",
  "site-visit-completed",
  "purchase-intent",
  "advisory",
  "status-change",
  "advisor-assigned",
  "note",
] as const;

export const SITE_VISIT_STATUSES = ["requested", "confirmed", "completed", "cancelled"] as const;

export const INVENTORY_KINDS = ["apartment", "villa", "commercial", "plot"] as const;

export const UNIT_STATUSES = ["available", "reserved", "sold"] as const;

export const BEDROOM_CONFIGS = ["1bhk", "2bhk", "3bhk", "4bhk", "5plus"] as const;

export const AREA_UNITS = ["sqft", "sqyd", "acre"] as const;

export const ANALYTICS_EVENT_TYPES = [
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
] as const;

export const leadSourceEnum = pgEnum("lead_source", LEAD_SOURCES);
export const leadStageEnum = pgEnum("lead_stage", LEAD_STAGES);
export const leadStatusEnum = pgEnum("lead_status", LEAD_STATUSES);
export const leadPurposeEnum = pgEnum("lead_purpose", LEAD_PURPOSES);
export const leadEventTypeEnum = pgEnum("lead_event_type", LEAD_EVENT_TYPES);
export const siteVisitStatusEnum = pgEnum("site_visit_status", SITE_VISIT_STATUSES);
export const inventoryKindEnum = pgEnum("inventory_kind", INVENTORY_KINDS);
export const unitStatusEnum = pgEnum("unit_status", UNIT_STATUSES);
export const bedroomConfigEnum = pgEnum("bedroom_config", BEDROOM_CONFIGS);
export const areaUnitEnum = pgEnum("area_unit", AREA_UNITS);
export const analyticsEventTypeEnum = pgEnum("analytics_event_type", ANALYTICS_EVENT_TYPES);

export const advisors = pgTable(
  "advisors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: varchar("phone", { length: 20 }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("advisors_email_key").on(table.email)],
);

/** Money is stored as a whole number of Indian rupees. See docs/DATA.md. */
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: varchar("reference", { length: 16 }).notNull(),
    name: text("name").notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: text("email"),
    projectSlug: text("project_slug"),
    categorySlug: text("category_slug"),
    budgetMin: bigint("budget_min", { mode: "number" }),
    budgetMax: bigint("budget_max", { mode: "number" }),
    purpose: leadPurposeEnum("purpose"),
    source: leadSourceEnum("source").notNull(),
    message: text("message"),
    preferredCallback: text("preferred_callback"),
    score: integer("score").notNull().default(0),
    stage: leadStageEnum("stage").notNull().default("cold"),
    status: leadStatusEnum("status").notNull().default("new"),
    advisorId: uuid("advisor_id").references(() => advisors.id, { onDelete: "set null" }),
    lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
    nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
    consent: boolean("consent").notNull().default(false),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmTerm: text("utm_term"),
    utmContent: text("utm_content"),
    ipHash: varchar("ip_hash", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("leads_reference_key").on(table.reference),
    index("leads_created_at_idx").on(table.createdAt),
    index("leads_status_idx").on(table.status),
    index("leads_stage_idx").on(table.stage),
    index("leads_project_slug_idx").on(table.projectSlug),
    index("leads_advisor_id_idx").on(table.advisorId),
    index("leads_phone_idx").on(table.phone),
  ],
);

export const siteVisits = pgTable(
  "site_visits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    projectSlug: text("project_slug"),
    preferredDate: date("preferred_date", { mode: "string" }).notNull(),
    preferredTime: text("preferred_time"),
    visitors: integer("visitors").notNull().default(1),
    status: siteVisitStatusEnum("status").notNull().default("requested"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("site_visits_lead_id_idx").on(table.leadId),
    index("site_visits_status_idx").on(table.status),
    index("site_visits_preferred_date_idx").on(table.preferredDate),
    index("site_visits_project_slug_idx").on(table.projectSlug),
  ],
);

/** The audit trail lead scoring reads. One row per scoreable interaction. */
export const leadEvents = pgTable(
  "lead_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    type: leadEventTypeEnum("type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("lead_events_lead_id_idx").on(table.leadId, table.createdAt),
    index("lead_events_type_idx").on(table.type),
  ],
);

export const inventoryUnits = pgTable(
  "inventory_units",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectSlug: text("project_slug").notNull(),
    kind: inventoryKindEnum("kind").notNull(),
    unitNumber: text("unit_number").notNull(),
    tower: text("tower"),
    floor: integer("floor"),
    bedrooms: bedroomConfigEnum("bedrooms"),
    areaMin: numeric("area_min", { precision: 12, scale: 2, mode: "number" }),
    areaMax: numeric("area_max", { precision: 12, scale: 2, mode: "number" }),
    areaUnit: areaUnitEnum("area_unit"),
    facing: text("facing"),
    roadWidthFt: integer("road_width_ft"),
    priceAmount: bigint("price_amount", { mode: "number" }),
    monthlyRentAmount: bigint("monthly_rent_amount", { mode: "number" }),
    leaseStatus: text("lease_status"),
    tenant: text("tenant"),
    status: unitStatusEnum("status").notNull().default("available"),
    isSample: boolean("is_sample").notNull().default(false),
    planX: numeric("plan_x", { precision: 6, scale: 2, mode: "number" }),
    planY: numeric("plan_y", { precision: 6, scale: 2, mode: "number" }),
    planW: numeric("plan_w", { precision: 6, scale: 2, mode: "number" }),
    planH: numeric("plan_h", { precision: 6, scale: 2, mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("inventory_units_project_unit_key").on(table.projectSlug, table.unitNumber),
    index("inventory_units_project_slug_idx").on(table.projectSlug),
    index("inventory_units_status_idx").on(table.status),
  ],
);

/** Newsletter signups. Not leads: no phone, no score, never joined to `leads`. */
export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    source: text("source").notNull().default("footer"),
    consent: boolean("consent").notNull().default(false),
    ipHash: varchar("ip_hash", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("subscribers_email_key").on(table.email)],
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: analyticsEventTypeEnum("type").notNull(),
    projectSlug: text("project_slug"),
    categorySlug: text("category_slug"),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    sessionHash: varchar("session_hash", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("analytics_events_type_created_at_idx").on(table.type, table.createdAt),
    index("analytics_events_project_slug_idx").on(table.projectSlug),
  ],
);

export type Advisor = typeof advisors.$inferSelect;
export type NewAdvisor = typeof advisors.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type SiteVisit = typeof siteVisits.$inferSelect;
export type NewSiteVisit = typeof siteVisits.$inferInsert;
export type LeadEvent = typeof leadEvents.$inferSelect;
export type NewLeadEvent = typeof leadEvents.$inferInsert;
export type InventoryUnitRow = typeof inventoryUnits.$inferSelect;
export type NewInventoryUnitRow = typeof inventoryUnits.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export type LeadSource = (typeof LEAD_SOURCES)[number];
export type LeadStage = (typeof LEAD_STAGES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadPurpose = (typeof LEAD_PURPOSES)[number];
export type LeadEventType = (typeof LEAD_EVENT_TYPES)[number];
export type SiteVisitStatus = (typeof SITE_VISIT_STATUSES)[number];
export type InventoryKind = (typeof INVENTORY_KINDS)[number];
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];
