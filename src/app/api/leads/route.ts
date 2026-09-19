import { intakeLead } from "../_lib/intake";
import { failure, identify, json, readJsonBody, throttle } from "../_lib/http";
import { logUnrecordedLead, SOURCE_EVENT } from "@/lib/leads";
import {
  enquirySchema,
  fieldErrors,
  firstIssueMessage,
  looksAutomated,
  resolveBudgetBand,
  type LeadSuccess,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

const LOST_LEAD_MESSAGE =
  "We could not record your enquiry. Please contact an advisor directly so nothing is lost.";

export async function POST(request: Request): Promise<Response> {
  let received: unknown = null;
  try {
    const identity = identify(request);
    const limit = throttle("leads", identity.ipHash);
    if (!limit.ok) {
      return failure(
        "rate-limited",
        "Too many submissions from this connection. Please try again shortly.",
        { retryAfterSeconds: limit.retryAfterSeconds },
      );
    }

    const body = await readJsonBody(request);
    if (!body.ok) return failure("invalid", "We could not read that submission.");
    received = body.data;

    const parsed = enquirySchema.safeParse(body.data);
    if (!parsed.success) {
      return failure("invalid", firstIssueMessage(parsed.error), {
        fields: fieldErrors(parsed.error),
      });
    }

    const values = parsed.data;
    if (looksAutomated({ website: values.website, startedAt: values.startedAt })) {
      return failure("rejected", "We could not verify this submission. Please call us instead.");
    }

    const budget = resolveBudgetBand(values.budgetBand);
    const result = await intakeLead({
      context: "POST /api/leads",
      input: {
        name: values.name,
        phone: values.phone,
        email: values.email,
        projectSlug: values.projectSlug,
        categorySlug: values.categorySlug,
        budgetMin: budget.min,
        budgetMax: budget.max,
        purpose: values.purpose,
        source: values.source,
        message: values.message,
        preferredCallback: values.preferredCallback,
        consent: values.consent,
        utmSource: values.utm.source,
        utmMedium: values.utm.medium,
        utmCampaign: values.utm.campaign,
        utmTerm: values.utm.term,
        utmContent: values.utm.content,
        ipHash: identity.ipHash,
        userAgent: identity.userAgent,
      },
      event: {
        type: SOURCE_EVENT[values.source],
        payload: {
          location: values.location,
          timeline: values.timeline,
          budgetBand: values.budgetBand,
          preferredCallback: values.preferredCallback,
        },
      },
    });

    if (!result.ok) return failure("unavailable", LOST_LEAD_MESSAGE);

    const success: LeadSuccess = { ok: true, reference: result.lead.reference };
    return json(success, 201);
  } catch (error) {
    logUnrecordedLead("POST /api/leads threw", received, error);
    return failure("unknown", LOST_LEAD_MESSAGE);
  }
}
