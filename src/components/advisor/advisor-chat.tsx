"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bookmark, Info, MessageSquareText, Scale, Sparkles } from "lucide-react";
import { MAX_COMPARE, useShortlist } from "@/components/providers/shortlist-provider";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { DISCLAIMERS } from "@/content/config";
import {
  EXAMPLE_PROMPTS,
  MAX_QUESTION_LENGTH,
  answerQuestion,
  renderProse,
  type AdvisorAnswer,
} from "@/lib/advisor";
import { trackCompare, trackSave, trackSearch } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/catalog";

type Status = "streaming" | "done";

interface Exchange {
  answer: AdvisorAnswer;
  prose: string;
  status: Status;
}

interface StreamEvent {
  type?: unknown;
  text?: unknown;
}

function readEvent(line: string): StreamEvent | null {
  try {
    const parsed: unknown = JSON.parse(line);
    return typeof parsed === "object" && parsed !== null ? (parsed as StreamEvent) : null;
  } catch {
    return null;
  }
}

async function* proseDeltas(response: Response): AsyncGenerator<string> {
  if (!response.body) return;
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
      if (!line) continue;
      const event = readEvent(line);
      if (event?.type === "delta" && typeof event.text === "string") yield event.text;
    }
  }
}

function Chip({
  children,
  onClick,
  active = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-left text-[0.8125rem] leading-snug transition-colors duration-300 disabled:opacity-50",
        active
          ? "border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--surface)]"
          : "border-[color:var(--hairline-strong)] bg-[color:var(--surface-sunken)] text-[color:var(--text-primary)] hover:border-[color:var(--text-primary)]",
      )}
    >
      {children}
    </button>
  );
}

export interface AdvisorChatProps {
  /** Pass `getAllProjects()` from a Server Component. */
  projects: Project[];
  compact?: boolean;
  className?: string;
}

export function AdvisorChat({ projects, compact = false, className }: AdvisorChatProps) {
  const router = useRouter();
  const inputId = useId();
  const { saved, compare, toggleSaved, toggleCompare, ready } = useShortlist();

  const [question, setQuestion] = useState("");
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [notice, setNotice] = useState<{ text: string; href: string; label: string } | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const ask = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim().slice(0, MAX_QUESTION_LENGTH);
      if (!trimmed) return;

      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;

      const answer = answerQuestion(trimmed, projects);
      setQuestion(trimmed);
      setNotice(null);
      setExchange({ answer, prose: "", status: "streaming" });
      trackSearch(trimmed, { surface: "ai-advisor", matches: answer.projects.length });

      let streamed = "";
      try {
        const response = await fetch("/api/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed }),
          signal: abort.signal,
        });
        if (!response.ok) throw new Error(`advisor responded ${response.status}`);
        for await (const delta of proseDeltas(response)) {
          if (abort.signal.aborted) return;
          streamed += delta;
          const snapshot = streamed;
          setExchange((current) =>
            current && current.answer === answer ? { ...current, prose: snapshot } : current,
          );
        }
      } catch {
        if (abort.signal.aborted) return;
      }

      if (abort.signal.aborted) return;
      const finalProse = streamed.trim().length > 0 ? streamed : renderProse(answer);
      setExchange((current) =>
        current && current.answer === answer ? { answer, prose: finalProse, status: "done" } : current,
      );
    },
    [projects],
  );

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(question);
  };

  const answer = exchange?.answer ?? null;
  const results = answer?.projects ?? [];
  const compareSlugs = answer
    ? (answer.compare.length ? answer.compare : results.map((project) => project.slug)).slice(0, MAX_COMPARE)
    : [];
  const allSaved = ready && results.length > 0 && results.every((project) => saved.includes(project.slug));
  const allComparing = ready && compareSlugs.length > 0 && compareSlugs.every((slug) => compare.includes(slug));

  const saveAll = () => {
    if (!results.length) return;
    let added = 0;
    for (const project of results) {
      if (!saved.includes(project.slug)) {
        toggleSaved(project.slug);
        trackSave(project.slug, true);
        added += 1;
      }
    }
    setNotice({
      text:
        added === 0
          ? "These are already in your shortlist."
          : `${added} ${added === 1 ? "property" : "properties"} saved to your shortlist.`,
      href: "/purchase/shortlist",
      label: "Open shortlist",
    });
  };

  const compareAll = () => {
    if (!compareSlugs.length) return;
    let rejected = 0;
    for (const slug of compareSlugs) {
      if (!compare.includes(slug) && !toggleCompare(slug)) rejected += 1;
    }
    trackCompare(compareSlugs);
    if (rejected === 0) {
      router.push("/purchase/compare");
      return;
    }
    setNotice({
      text: `The comparison holds up to ${MAX_COMPARE} properties, so ${rejected} could not be added. Remove one to make room.`,
      href: "/purchase/compare",
      label: "Open comparison",
    });
  };

  const advisorHref = results.length ? `/advisory?project=${encodeURIComponent(results[0].slug)}` : "/advisory";
  const streaming = exchange?.status === "streaming";

  return (
    <div className={cn("relative", className)}>
      <form
        onSubmit={onSubmit}
        className={cn(
          "rounded-panel border border-[color:var(--hairline)] bg-[color:var(--surface)] shadow-lift",
          compact ? "p-3" : "p-3 sm:p-4",
        )}
      >
        <label htmlFor={inputId} className="sr-only">
          Ask TokenZameen AI about the collection
        </label>
        <div className="flex items-end gap-3">
          <Sparkles className="mb-3.5 ml-2 hidden size-5 shrink-0 text-[color:var(--accent)] sm:block" aria-hidden />
          <textarea
            id={inputId}
            name="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void ask(question);
              }
            }}
            rows={compact ? 2 : 2}
            maxLength={MAX_QUESTION_LENGTH}
            placeholder="Describe what you are looking for, in your own words"
            className={cn(
              "min-h-[3.25rem] w-full resize-none bg-transparent px-2 py-3 text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none",
              compact ? "text-base" : "text-base sm:text-xl",
            )}
          />
          <Button
            type="submit"
            variant="solid"
            size={compact ? "md" : "lg"}
            disabled={question.trim().length < 2 || streaming}
            className="shrink-0"
          >
            Ask
            <ArrowUpRight className="size-4" aria-hidden />
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Example questions">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <Chip
            key={prompt}
            onClick={() => void ask(prompt)}
            active={answer?.question === prompt}
            disabled={streaming}
          >
            {prompt}
          </Chip>
        ))}
      </div>

      <p role="status" className="sr-only">
        {streaming
          ? "TokenZameen AI is reading the collection."
          : answer
            ? `Answer ready with ${results.length} ${results.length === 1 ? "property" : "properties"}.`
            : ""}
      </p>

      {exchange && answer ? (
        <div className={cn("mt-8 border-t border-[color:var(--hairline)]", compact ? "pt-6" : "pt-8")}>
          <p className="eyebrow text-[color:var(--text-muted)]">You asked</p>
          <p className="mt-2 font-display text-lg text-[color:var(--text-primary)] sm:text-xl">
            {answer.question}
          </p>

          {answer.criteria.length ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="How the question was read">
              {answer.criteria.map((criterion) => (
                <li
                  key={criterion}
                  className="rounded-full border border-[color:var(--hairline)] px-3 py-1 text-xs text-[color:var(--text-secondary)]"
                >
                  {criterion}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 flex items-start gap-3">
            <MessageSquareText className="mt-1 size-4 shrink-0 text-[color:var(--accent)]" aria-hidden />
            <p className="min-h-[1.75rem] max-w-3xl text-[0.9375rem] leading-relaxed text-[color:var(--text-primary)]">
              {exchange.prose.length ? exchange.prose : streaming ? answer.interpretation : renderProse(answer)}
              {streaming ? (
                <span
                  aria-hidden
                  className="ml-1 inline-block h-4 w-[2px] translate-y-0.5 bg-[color:var(--accent)] motion-safe:animate-pulse"
                />
              ) : null}
            </p>
          </div>

          {results.length ? (
            <ul className={cn("mt-6 grid gap-3", compact ? "" : "sm:grid-cols-2")}>
              {results.map((project) => (
                <li key={project.slug}>
                  <PropertyCard project={project} variant="compact" className="h-full" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-card border border-dashed border-[color:var(--hairline-strong)] px-5 py-6">
              <p className="text-sm text-[color:var(--text-primary)]">
                Nothing in the collection matches all of that yet.
              </p>
              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                The collection is a short, curated one. Loosen a criterion below, or tell an advisor what you
                are after — they look beyond what is published here.
              </p>
            </div>
          )}

          {answer.caveats.length ? (
            <ul className="mt-5 space-y-2">
              {answer.caveats.map((caveat) => (
                <li key={caveat} className="flex items-start gap-2 text-xs leading-relaxed text-[color:var(--text-secondary)]">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-[color:var(--accent)]" aria-hidden />
                  <span>{caveat}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {results.length ? (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={compareAll}
                disabled={compareSlugs.length < 2 || allComparing}
              >
                <Scale className="size-3.5" aria-hidden />
                {allComparing ? "In comparison" : "Compare"}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={saveAll} disabled={allSaved}>
                <Bookmark className={cn("size-3.5", allSaved && "fill-current")} aria-hidden />
                {allSaved ? "Saved" : "Save"}
              </Button>
              <Button href={advisorHref} variant="solid" size="sm">
                Talk to an Advisor
              </Button>
              {answer.href ? (
                <Link
                  href={answer.href}
                  className="ml-auto inline-flex min-h-9 items-center gap-1 text-xs text-[color:var(--accent)] underline-offset-4 hover:underline"
                >
                  Open these filters in the discovery engine
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              ) : null}
            </div>
          ) : null}

          {notice ? (
            <p role="status" className="mt-3 text-xs text-[color:var(--text-secondary)]">
              {notice.text}{" "}
              <Link href={notice.href} className="text-[color:var(--accent)] underline-offset-4 hover:underline">
                {notice.label}
              </Link>
            </p>
          ) : null}

          {answer.followUps.length ? (
            <div className="mt-6">
              <p className="eyebrow text-[color:var(--text-muted)]">Keep going</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {answer.followUps.map((followUp) => (
                  <Chip key={followUp} onClick={() => void ask(followUp)} disabled={streaming}>
                    {followUp}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 space-y-2 border-t border-[color:var(--hairline)] pt-5 text-xs leading-relaxed text-[color:var(--text-muted)]">
            <p>
              TokenZameen AI only uses information published on this platform. Anything it does not list is on
              request, and an advisor can confirm it.
            </p>
            <p>{DISCLAIMERS.intelligence}</p>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-xs leading-relaxed text-[color:var(--text-muted)]">
          TokenZameen AI only uses information published on this platform. It helps you find things; it does not
          give investment advice.
        </p>
      )}
    </div>
  );
}
