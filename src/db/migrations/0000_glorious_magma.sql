CREATE TYPE "public"."analytics_event_type" AS ENUM('page-view', 'property-view', 'category-view', 'search', 'filter-use', 'save', 'compare', 'brochure-download', 'enquiry', 'call', 'whatsapp', 'site-visit-request', 'purchase-request');--> statement-breakpoint
CREATE TYPE "public"."area_unit" AS ENUM('sqft', 'sqyd', 'acre');--> statement-breakpoint
CREATE TYPE "public"."bedroom_config" AS ENUM('1bhk', '2bhk', '3bhk', '4bhk', '5plus');--> statement-breakpoint
CREATE TYPE "public"."inventory_kind" AS ENUM('apartment', 'villa', 'commercial', 'plot');--> statement-breakpoint
CREATE TYPE "public"."lead_event_type" AS ENUM('created', 'property-view', 'save', 'compare', 'brochure-download', 'document-request', 'request-price', 'enquiry', 'callback', 'whatsapp', 'call', 'site-visit-request', 'site-visit-completed', 'purchase-intent', 'advisory', 'status-change', 'advisor-assigned', 'note');--> statement-breakpoint
CREATE TYPE "public"."lead_purpose" AS ENUM('self-use', 'investment', 'second-home', 'rental-income', 'capital-appreciation', 'commercial-income', 'land-banking');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('property-enquiry', 'site-visit', 'request-price', 'brochure-download', 'investment-enquiry', 'callback', 'whatsapp', 'purchase-intent', 'advisory', 'document-access');--> statement-breakpoint
CREATE TYPE "public"."lead_stage" AS ENUM('cold', 'warm', 'hot', 'purchase-ready');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'qualified', 'site-visit', 'negotiation', 'booking', 'purchased', 'lost');--> statement-breakpoint
CREATE TYPE "public"."site_visit_status" AS ENUM('requested', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."unit_status" AS ENUM('available', 'reserved', 'sold');--> statement-breakpoint
CREATE TABLE "advisors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(20),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "analytics_event_type" NOT NULL,
	"project_slug" text,
	"category_slug" text,
	"payload" jsonb,
	"session_hash" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_slug" text NOT NULL,
	"kind" "inventory_kind" NOT NULL,
	"unit_number" text NOT NULL,
	"tower" text,
	"floor" integer,
	"bedrooms" "bedroom_config",
	"area_min" numeric(12, 2),
	"area_max" numeric(12, 2),
	"area_unit" "area_unit",
	"facing" text,
	"road_width_ft" integer,
	"price_amount" bigint,
	"monthly_rent_amount" bigint,
	"lease_status" text,
	"tenant" text,
	"status" "unit_status" DEFAULT 'available' NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"plan_x" numeric(6, 2),
	"plan_y" numeric(6, 2),
	"plan_w" numeric(6, 2),
	"plan_h" numeric(6, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" "lead_event_type" NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(16) NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" text,
	"project_slug" text,
	"category_slug" text,
	"budget_min" bigint,
	"budget_max" bigint,
	"purpose" "lead_purpose",
	"source" "lead_source" NOT NULL,
	"message" text,
	"preferred_callback" text,
	"score" integer DEFAULT 0 NOT NULL,
	"stage" "lead_stage" DEFAULT 'cold' NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"advisor_id" uuid,
	"last_contact_at" timestamp with time zone,
	"next_follow_up_at" timestamp with time zone,
	"consent" boolean DEFAULT false NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"ip_hash" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"project_slug" text,
	"preferred_date" date NOT NULL,
	"preferred_time" text,
	"visitors" integer DEFAULT 1 NOT NULL,
	"status" "site_visit_status" DEFAULT 'requested' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_advisor_id_advisors_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."advisors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "advisors_email_key" ON "advisors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "analytics_events_type_created_at_idx" ON "analytics_events" USING btree ("type","created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_project_slug_idx" ON "analytics_events" USING btree ("project_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_units_project_unit_key" ON "inventory_units" USING btree ("project_slug","unit_number");--> statement-breakpoint
CREATE INDEX "inventory_units_project_slug_idx" ON "inventory_units" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "inventory_units_status_idx" ON "inventory_units" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lead_events_lead_id_idx" ON "lead_events" USING btree ("lead_id","created_at");--> statement-breakpoint
CREATE INDEX "lead_events_type_idx" ON "lead_events" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "leads_reference_key" ON "leads" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_stage_idx" ON "leads" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "leads_project_slug_idx" ON "leads" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "leads_advisor_id_idx" ON "leads" USING btree ("advisor_id");--> statement-breakpoint
CREATE INDEX "leads_phone_idx" ON "leads" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "site_visits_lead_id_idx" ON "site_visits" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "site_visits_status_idx" ON "site_visits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "site_visits_preferred_date_idx" ON "site_visits" USING btree ("preferred_date");--> statement-breakpoint
CREATE INDEX "site_visits_project_slug_idx" ON "site_visits" USING btree ("project_slug");