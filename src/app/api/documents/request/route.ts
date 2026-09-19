import { intakeLead } from "../../_lib/intake";
import { failure, identify, json, readJsonBody, throttle } from "../../_lib/http";
import { logUnrecordedLead } from "@/lib/leads";
import {
  documentRequestSchema,
  fieldErrors,
  firstIssueMessage,
  looksAutomated,
  type LeadSuccess,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

const LOST_LEAD_MESSAGE =
  "We could not record your document request. Please contact an advisor directly so nothing is lost.";

export async function POST(request: Request): Promise<Response> {
  let received: unknown = null;
  try {
    const identity = identify(request);
    const limit = throttle("documents", identity.ipHash);
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

    const parsed = documentRequestSchema.safeParse(body.data);
    if (!parsed.success) {
      return failure("invalid", firstIssueMessage(parsed.error), {
        fields: fieldErrors(parsed.error),
      });
    }

    const values = parsed.data;
    if (looksAutomated({ website: values.website, startedAt: values.startedAt })) {
      return failure("rejected", "We could not verify this submission. Please call us instead.");
    }

    const result = await intakeLead({
      context: "POST /api/documents/request",
      input: {
        name: values.name,
        phone: values.phone,
        email: values.email,
        projectSlug: values.projectSlug,
        source: "document-access",
        message: null,
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
        type: "document-request",
        payload: {
          projectSlug: values.projectSlug,
          documentId: values.documentId,
          documentTitle: values.documentTitle,
        },
      },
    });

    if (!result.ok) return failure("unavailable", LOST_LEAD_MESSAGE);

    const success: LeadSuccess = { ok: true, reference: result.lead.reference };
    return json(success, 201);
  } catch (error) {
    logUnrecordedLead("POST /api/documents/request threw", received, error);
    return failure("unknown", LOST_LEAD_MESSAGE);
  }
}
