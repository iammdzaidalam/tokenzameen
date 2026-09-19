import { createHash } from "node:crypto";
import { failure, identify, json, readJsonBody, throttle } from "../_lib/http";
import { recordAnalyticsEvent } from "@/db/repositories";
import { analyticsEventSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const ACCEPTED = { ok: true } as const;

/**
 * Always 202. Analytics must never be the reason a page feels slow or a button
 * looks broken, so a rejected, malformed or unstorable event is acknowledged and
 * dropped rather than reported back to the UI.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const identity = identify(request);
    const limit = throttle("analytics", identity.ipHash, { max: 120, windowMs: 60_000 });
    if (!limit.ok) {
      return failure("rate-limited", "Too many events.", {
        retryAfterSeconds: limit.retryAfterSeconds,
        status: 202,
      });
    }

    const body = await readJsonBody(request);
    if (!body.ok) return json(ACCEPTED, 202);

    const parsed = analyticsEventSchema.safeParse(body.data);
    if (!parsed.success) return json(ACCEPTED, 202);

    const values = parsed.data;
    const sessionHash = values.sessionId
      ? createHash("sha256").update(`${identity.ipHash}:${values.sessionId}`).digest("hex")
      : identity.ipHash;

    const result = await recordAnalyticsEvent({
      type: values.type,
      projectSlug: values.projectSlug,
      categorySlug: values.categorySlug,
      payload: values.payload,
      sessionHash,
    });

    if (!result.ok && result.error.code !== "no-database") {
      console.error("[analytics] event dropped", result.error);
    }

    return json(ACCEPTED, 202);
  } catch (error) {
    console.error("[analytics] ingestion threw", error);
    return json(ACCEPTED, 202);
  }
}
