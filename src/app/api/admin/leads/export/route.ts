import { listAdvisors, listLeads } from "@/db/repositories";
import type { Lead } from "@/db/schema";
import { json } from "@/app/api/_lib/http";
import { getSession } from "@/lib/auth";
import { getProject } from "@/lib/catalog";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

const COLUMNS = [
  "reference",
  "name",
  "phone",
  "email",
  "project_slug",
  "project_name",
  "category_slug",
  "budget_min_inr",
  "budget_max_inr",
  "purpose",
  "source",
  "score",
  "stage",
  "status",
  "advisor",
  "last_contact_at",
  "next_follow_up_at",
  "consent",
  "preferred_callback",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "created_at",
  "updated_at",
  "message",
] as const;

/** Quotes every cell and neutralises formula-leading characters so the file is safe to open in a spreadsheet. */
function cell(value: string | number | boolean | Date | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const text = value instanceof Date ? value.toISOString() : String(value);
  const escaped = text.replace(/"/g, '""');
  // A leading +, = , - or @ is read as a formula. Phone numbers are E.164 and
  // would all be mangled by an apostrophe prefix, so they go out as a quoted
  // formula string, which spreadsheets render as the literal number.
  if (/^\+\d[\d\s-]*$/.test(text)) return `"=""${escaped}"""`;
  if (/^[=+\-@\t\r]/.test(text)) return `"'${escaped}"`;
  return `"${escaped}"`;
}

function row(lead: Lead, advisorNames: Map<string, string>): string {
  const values: Array<string | number | boolean | Date | null> = [
    lead.reference,
    lead.name,
    lead.phone,
    lead.email,
    lead.projectSlug,
    lead.projectSlug ? (getProject(lead.projectSlug)?.name ?? null) : null,
    lead.categorySlug,
    lead.budgetMin,
    lead.budgetMax,
    lead.purpose,
    lead.source,
    lead.score,
    lead.stage,
    lead.status,
    lead.advisorId ? (advisorNames.get(lead.advisorId) ?? lead.advisorId) : null,
    lead.lastContactAt,
    lead.nextFollowUpAt,
    lead.consent,
    lead.preferredCallback,
    lead.utmSource,
    lead.utmMedium,
    lead.utmCampaign,
    lead.utmTerm,
    lead.utmContent,
    lead.createdAt,
    lead.updatedAt,
    lead.message,
  ];
  return values.map(cell).join(",");
}

export async function GET(): Promise<Response> {
  try {
    if (!(await getSession())) {
      return json({ ok: false, error: "unauthorized", message: "Sign in to the admin panel first." }, 401);
    }
    if (!env.hasDatabase) {
      return json({ ok: false, error: "unavailable", message: "DATABASE_URL is not set; there is nothing to export." }, 503);
    }

    const advisors = await listAdvisors();
    const advisorNames = new Map<string, string>(
      advisors.ok ? advisors.data.map((advisor) => [advisor.id, advisor.name]) : [],
    );

    const leads: Lead[] = [];
    let truncated = false;
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const result = await listLeads({ page, pageSize: PAGE_SIZE });
      if (!result.ok) {
        return json({ ok: false, error: "unavailable", message: "The database request failed." }, 503);
      }
      leads.push(...result.data.items);
      if (leads.length >= result.data.total || result.data.items.length < PAGE_SIZE) break;
      if (page === MAX_PAGES) truncated = true;
    }

    const lines = [COLUMNS.join(","), ...leads.map((lead) => row(lead, advisorNames))];
    const body = `﻿${lines.join("\r\n")}\r\n`;
    const stamp = new Date().toISOString().slice(0, 10);

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tokenzameen-leads-${stamp}.csv"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Row-Count": String(leads.length),
        ...(truncated ? { "X-Truncated": "true" } : {}),
      },
    });
  } catch (error) {
    console.error("[admin] GET /api/admin/leads/export threw", error);
    return json({ ok: false, error: "unknown", message: "The export failed." }, 500);
  }
}
