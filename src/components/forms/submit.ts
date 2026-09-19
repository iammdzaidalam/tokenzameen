"use client";

import { useCallback, useRef, useState } from "react";
import { readStore, writeStore } from "@/lib/hooks";
import type { ApiFailure, LeadResponse } from "@/lib/validation";

export type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; reference: string }
  | { status: "failure"; message: string };

const UTM_KEY = "tz.utm";

export interface Utm {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
}

const EMPTY_UTM: Utm = { source: null, medium: null, campaign: null, term: null, content: null };

/**
 * First-touch attribution: the campaign that brought the buyer to the site is
 * the one credited, not the page they happened to submit from.
 */
export function readUtm(): Utm {
  if (typeof window === "undefined") return EMPTY_UTM;
  const params = new URLSearchParams(window.location.search);
  const current: Utm = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    term: params.get("utm_term"),
    content: params.get("utm_content"),
  };
  const hasCurrent = Object.values(current).some((value) => value !== null);
  if (hasCurrent) {
    writeStore(UTM_KEY, current);
    return current;
  }
  return readStore<Utm>(UTM_KEY, EMPTY_UTM);
}

const NETWORK_FAILURE: ApiFailure = {
  ok: false,
  error: "unavailable",
  message: "We could not reach TokenZameen. Your enquiry has not been sent.",
};

export async function postLead(endpoint: string, body: unknown): Promise<LeadResponse> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data: unknown = await response.json().catch(() => null);
    if (
      typeof data === "object" &&
      data !== null &&
      "ok" in data &&
      typeof (data as { ok: unknown }).ok === "boolean"
    ) {
      return data as LeadResponse;
    }
    return NETWORK_FAILURE;
  } catch {
    return NETWORK_FAILURE;
  }
}

/**
 * Owns the one rule that matters here: the UI only ever reaches `success` when
 * the server has handed back a reference code.
 */
export function useLeadSubmit(endpoint: string) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const inFlight = useRef(false);

  const submit = useCallback(
    async (body: unknown): Promise<LeadResponse | null> => {
      if (inFlight.current) return null;
      inFlight.current = true;
      setState({ status: "submitting" });
      try {
        const response = await postLead(endpoint, body);
        if (response.ok && response.reference) {
          setState({ status: "success", reference: response.reference });
        } else {
          setState({
            status: "failure",
            message: response.ok ? NETWORK_FAILURE.message : response.message,
          });
        }
        return response;
      } finally {
        inFlight.current = false;
      }
    },
    [endpoint],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}

export function sendAnalyticsEvent(body: unknown): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(body);
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
      return;
    }
  } catch {
    // Beacons are blocked in some privacy modes; fall through to fetch.
  }
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
