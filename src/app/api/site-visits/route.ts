import { intakeLead } from "../_lib/intake";
import { failure, identify, json, readJsonBody, throttle } from "../_lib/http";
import { appendLeadEvent, createSiteVisit, findLeadByPhone } from "@/db/repositories";
import { logUnrecordedLead } from "@/lib/leads";
import {
  fieldErrors,
  firstIssueMessage,
  looksAutomated,
  siteVisitSchema,
  type LeadSuccess,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

const LOST_LEAD_MESSAGE =
  "We could not record your site visit request. Please contact an advisor directly so nothing is lost.";

export async function POST(request: Request): Promise<Response> {
  let received: unknown = null;
  try {
    const identity = identify(request);
    const limit = throttle("site-visits", identity.ipHash);
    if (!limit.ok) {
      return failure(
        "rate-limited",
        "Too many requests from this connection. Please try again shortly.",
        { retryAfterSeconds: limit.retryAfterSeconds },
      );
    }

    const body = await readJsonBody(request);
    if (!body.ok) return failure("invalid", "We could not read that submission.");
    received = body.data;

    const parsed = siteVisitSchema.safeParse(body.data);
    if (!parsed.success) {
      return failure("invalid", firstIssueMessage(parsed.error), {
        fields: fieldErrors(parsed.error),
      });
    }

    const values = parsed.data;
    if (looksAutomated({ website: values.website, startedAt: values.startedAt })) {
      return failure("rejected", "We could not verify this submission. Please call us instead.");
    }

    const visitPayload = {
      projectSlug: values.projectSlug,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
      visitors: values.visitors,
    };

    const existing = await findLeadByPhone(values.phone);
    if (!existing.ok) {
      logUnrecordedLead("POST /api/site-visits (lookup failed)", values);
      return failure("unavailable", LOST_LEAD_MESSAGE);
    }

    let leadId: string;
    let reference: string;

    if (existing.data) {
      leadId = existing.data.id;
      reference = existing.data.reference;
      const event = await appendLeadEvent({
        leadId,
        type: "site-visit-request",
        payload: visitPayload,
      });
      if (!event.ok) {
        logUnrecordedLead("POST /api/site-visits (event failed)", values);
        return failure("unavailable", LOST_LEAD_MESSAGE);
      }
    } else {
      const result = await intakeLead({
        context: "POST /api/site-visits",
        input: {
          name: values.name,
          phone: values.phone,
          email: values.email,
          projectSlug: values.projectSlug,
          source: "site-visit",
          message: values.message,
          consent: values.consent,
          utmSource: values.utm.source,
          utmMedium: values.utm.medium,
          utmCampaign: values.utm.campaign,
          utmTerm: values.utm.term,
          utmContent: values.utm.content,
          ipHash: identity.ipHash,
          userAgent: identity.userAgent,
        },
        event: { type: "site-visit-request", payload: visitPayload },
      });
      if (!result.ok) return failure("unavailable", LOST_LEAD_MESSAGE);
      leadId = result.lead.id;
      reference = result.lead.reference;
    }

    const visit = await createSiteVisit({
      leadId,
      projectSlug: values.projectSlug,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
      visitors: values.visitors,
      notes: values.message,
    });

    if (!visit.ok) {
      logUnrecordedLead("POST /api/site-visits (visit row failed)", { ...values, leadId });
      return failure("unavailable", LOST_LEAD_MESSAGE);
    }

    const success: LeadSuccess = { ok: true, reference };
    return json(success, 201);
  } catch (error) {
    logUnrecordedLead("POST /api/site-visits threw", received, error);
    return failure("unknown", LOST_LEAD_MESSAGE);
  }
}
