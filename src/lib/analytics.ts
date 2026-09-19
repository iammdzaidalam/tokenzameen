import type { AnalyticsEventInput } from "@/lib/validation";
import type { CategorySlug } from "@/types/catalog";
import type { LeadSource } from "@/db/schema";

export type AnalyticsEvent = AnalyticsEventInput["type"];

export interface TrackOptions {
  projectSlug?: string | null;
  categorySlug?: CategorySlug | null;
  payload?: Record<string, unknown> | null;
}

const ENDPOINT = "/api/analytics";
const SESSION_KEY = "tz.session.v1";

function sessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget. `POST /api/analytics` always answers 202 and the caller
 * never waits on it, so nothing here can make a page feel slow or a button
 * look broken. Body shape mirrors `analyticsEventSchema`.
 */
export function track(type: AnalyticsEvent, options: TrackOptions = {}): void {
  if (typeof window === "undefined") return;

  const body: AnalyticsEventInput = {
    type,
    projectSlug: options.projectSlug ?? null,
    categorySlug: options.categorySlug ?? null,
    sessionId: sessionId(),
    payload: options.payload ?? null,
  };

  let serialized: string;
  try {
    serialized = JSON.stringify(body);
  } catch {
    return;
  }

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const accepted = navigator.sendBeacon(
        ENDPOINT,
        new Blob([serialized], { type: "application/json" }),
      );
      if (accepted) return;
    }
  } catch {
    // Beacons are refused in some privacy modes; fall through to fetch.
  }

  try {
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serialized,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    return;
  }
}

export function trackPageView(path: string, referrer?: string | null): void {
  track("page-view", { payload: { path, referrer: referrer ?? null } });
}

export function trackPropertyView(slug: string, categorySlug?: CategorySlug | null): void {
  track("property-view", { projectSlug: slug, categorySlug: categorySlug ?? null });
}

export function trackCategoryView(categorySlug: CategorySlug): void {
  track("category-view", { categorySlug });
}

export function trackSearch(query: string, extra?: { surface?: string; matches?: number }): void {
  const trimmed = query.trim().slice(0, 200);
  if (!trimmed) return;
  track("search", { payload: { query: trimmed, ...extra } });
}

export function trackFilterUse(filters: Record<string, unknown>): void {
  track("filter-use", { payload: filters });
}

export function trackSave(slug: string, saved: boolean): void {
  track("save", { projectSlug: slug, payload: { saved } });
}

export function trackCompare(slugs: string[]): void {
  track("compare", { projectSlug: slugs[0] ?? null, payload: { slugs } });
}

export function trackBrochureDownload(slug: string, documentId?: string | null): void {
  track("brochure-download", { projectSlug: slug, payload: { documentId: documentId ?? null } });
}

export function trackEnquiry(source: LeadSource, slug?: string | null): void {
  track("enquiry", { projectSlug: slug ?? null, payload: { source } });
}

export function trackCall(slug?: string | null): void {
  track("call", { projectSlug: slug ?? null });
}

export function trackWhatsAppClick(slug?: string | null): void {
  track("whatsapp", { projectSlug: slug ?? null });
}

export function trackSiteVisitRequest(slug?: string | null): void {
  track("site-visit-request", { projectSlug: slug ?? null });
}

export function trackPurchaseRequest(slug?: string | null): void {
  track("purchase-request", { projectSlug: slug ?? null });
}
