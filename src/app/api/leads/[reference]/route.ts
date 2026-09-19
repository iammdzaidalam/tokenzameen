import { failure, identify, json, throttle } from "../../_lib/http";
import { getLeadByReference } from "@/db/repositories";
import { LEAD_STATUS_LABEL } from "@/lib/leads";
import { referenceSchema, type LeadStatusSuccess } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * A buyer checking their own enquiry. Only the fields they already know or are
 * owed come back: never the score, the stage, the advisor, the message or the
 * contact details held on file.
 */
export async function GET(
  request: Request,
  context: RouteContext<"/api/leads/[reference]">,
): Promise<Response> {
  try {
    const identity = identify(request);
    const limit = throttle("lead-lookup", identity.ipHash, { max: 20, windowMs: 60_000 });
    if (!limit.ok) {
      return failure("rate-limited", "Too many lookups. Please try again shortly.", {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    const { reference } = await context.params;
    const parsed = referenceSchema.safeParse(reference);
    if (!parsed.success) return failure("not-found", "No enquiry found with that reference.");

    const result = await getLeadByReference(parsed.data);
    if (!result.ok) {
      if (result.error.code === "not-found") {
        return failure("not-found", "No enquiry found with that reference.");
      }
      return failure("unavailable", "We cannot look that up right now. Please try again shortly.");
    }

    const lead = result.data;
    const body: LeadStatusSuccess = {
      ok: true,
      reference: lead.reference,
      status: lead.status,
      statusLabel: LEAD_STATUS_LABEL[lead.status],
      projectSlug: lead.projectSlug,
      createdAt: lead.createdAt.toISOString(),
      lastContactAt: lead.lastContactAt?.toISOString() ?? null,
      nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
    };
    return json(body);
  } catch (error) {
    console.error("[api] GET /api/leads/[reference] threw", error);
    return failure("unknown", "We cannot look that up right now. Please try again shortly.");
  }
}
