import { z } from "zod";
import { failure, identify, readJsonBody, throttle } from "../_lib/http";
import {
  MAX_QUESTION_LENGTH,
  advisorSystemPrompt,
  answerQuestion,
  renderProse,
  toEnvelope,
  type AdvisorEnvelope,
} from "@/lib/advisor";
import { firstIssueMessage } from "@/lib/validation";

export const dynamic = "force-dynamic";

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-sonnet-5";
const MODEL_TIMEOUT_MS = 15_000;

const questionSchema = z.object({
  question: z.string().trim().min(2, "Ask a fuller question.").max(MAX_QUESTION_LENGTH),
});

export type AdvisorMode = "model" | "deterministic";

/**
 * One line of NDJSON per event. The envelope arrives first so the client can
 * render the recommendation cards before any prose exists; prose follows as
 * deltas from either the language model or the deterministic renderer.
 */
export type AdvisorStreamEvent =
  | { type: "answer"; mode: AdvisorMode; answer: AdvisorEnvelope }
  | { type: "delta"; text: string }
  | { type: "done"; mode: AdvisorMode; complete: boolean };

function gatewayToken(): string | null {
  return process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN ?? null;
}

interface ChatCompletionChunk {
  choices?: Array<{ delta?: { content?: string | null }; finish_reason?: string | null }>;
}

function parseChunk(raw: string): string | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const chunk = parsed as ChatCompletionChunk;
    const content = chunk.choices?.[0]?.delta?.content;
    return typeof content === "string" && content.length > 0 ? content : null;
  } catch {
    return null;
  }
}

/**
 * Streams tokens from the gateway's OpenAI-compatible endpoint. Yields nothing
 * and returns false when the call fails before the first token, so the caller
 * can fall back to the deterministic prose without the buyer seeing a gap.
 */
async function* modelDeltas(
  token: string,
  system: string,
  question: string,
  signal: AbortSignal,
): AsyncGenerator<string, boolean> {
  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_ADVISOR_MODEL ?? DEFAULT_MODEL,
      stream: true,
      temperature: 0.2,
      max_tokens: 320,
      messages: [
        { role: "system", content: system },
        { role: "user", content: question },
      ],
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    console.error("[advisor] gateway refused the request", response.status);
    return false;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline = buffer.indexOf("\n");
    while (newline !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      newline = buffer.indexOf("\n");

      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return true;
      const text = parseChunk(data);
      if (text) yield text;
    }
  }
  return true;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const identity = identify(request);
    const limit = throttle("advisor", identity.ipHash, { max: 20, windowMs: 60_000 });
    if (!limit.ok) {
      return failure("rate-limited", "That is a lot of questions at once. Give it a minute and try again.", {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    const body = await readJsonBody(request);
    if (!body.ok) return failure("invalid", "We could not read that question.");

    const parsed = questionSchema.safeParse(body.data);
    if (!parsed.success) return failure("invalid", firstIssueMessage(parsed.error));

    const answer = answerQuestion(parsed.data.question);
    const envelope = toEnvelope(answer);
    const token = gatewayToken();
    const mode: AdvisorMode = token && answer.projects.length > 0 ? "model" : "deterministic";

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emit = (event: AdvisorStreamEvent) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };

        emit({ type: "answer", mode, answer: envelope });

        let complete = false;
        let streamedAny = false;

        if (mode === "model" && token) {
          const abort = new AbortController();
          const timer = setTimeout(() => abort.abort(), MODEL_TIMEOUT_MS);
          try {
            const deltas = modelDeltas(token, advisorSystemPrompt(answer), answer.question, abort.signal);
            while (true) {
              const next = await deltas.next();
              if (next.done) {
                complete = next.value;
                break;
              }
              streamedAny = true;
              emit({ type: "delta", text: next.value });
            }
          } catch (error) {
            console.error("[advisor] model stream failed", error);
          } finally {
            clearTimeout(timer);
          }
        }

        if (!streamedAny) {
          emit({ type: "delta", text: renderProse(answer) });
          complete = true;
          emit({ type: "done", mode: "deterministic", complete });
        } else {
          emit({ type: "done", mode: "model", complete });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[advisor] request threw", error);
    return failure("unknown", "TokenZameen AI is unavailable right now. An advisor can still help.");
  }
}
