import { z } from "zod";
import { failure, identify, json, readJsonBody, throttle } from "../_lib/http";
import { subscribe } from "@/db/repositories";
import {
  emailSchema,
  fieldErrors,
  firstIssueMessage,
  honeypotSchema,
  looksAutomated,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

const newsletterSchema = z.object({
  email: emailSchema,
  consent: z.boolean().refine((value) => value === true, "Please agree to receive updates"),
  website: honeypotSchema,
  source: z.string().trim().max(40).optional(),
});

const UNAVAILABLE_MESSAGE = "We could not save your subscription right now. Please try again shortly.";

/**
 * A subscriber is not a lead: no phone, no score, no reference code. It still
 * never fakes success — without a database the response is a 503, and the
 * address is logged so it can be added by hand.
 */
export async function POST(request: Request): Promise<Response> {
  let received: unknown = null;
  try {
    const identity = identify(request);
    const limit = throttle("newsletter", identity.ipHash, { max: 5, windowMs: 60_000 });
    if (!limit.ok) {
      return failure("rate-limited", "Too many attempts. Please try again shortly.", {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    const body = await readJsonBody(request);
    if (!body.ok) return failure("invalid", "We could not read that submission.");
    received = body.data;

    const parsed = newsletterSchema.safeParse(body.data);
    if (!parsed.success) {
      return failure("invalid", firstIssueMessage(parsed.error), {
        fields: fieldErrors(parsed.error),
      });
    }

    const values = parsed.data;
    if (looksAutomated({ website: values.website })) {
      return failure("rejected", "We could not verify this submission.");
    }

    const result = await subscribe(values.email, {
      source: values.source ?? "footer",
      consent: values.consent,
      ipHash: identity.ipHash,
      userAgent: identity.userAgent,
    });

    if (!result.ok) {
      console.error(
        "[newsletter:UNRECORDED] subscription was NOT persisted",
        JSON.stringify({ at: new Date().toISOString(), email: values.email, source: values.source ?? "footer" }),
        result.error,
      );
      return failure("unavailable", UNAVAILABLE_MESSAGE);
    }

    return json({ ok: true }, 201);
  } catch (error) {
    console.error("[newsletter] POST /api/newsletter threw", received, error);
    return failure("unknown", UNAVAILABLE_MESSAGE);
  }
}
