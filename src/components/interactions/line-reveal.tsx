"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface RevealStatement {
  id: string;
  text: string;
  attribution?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Splits rendered text into visual lines by measuring where each word lands,
 * then masks every line so it can rise into view. Re-measures on resize, since
 * line breaks depend on the container width.
 */
function useMeasuredLines(text: string, deps: unknown[]) {
  const probeRef = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState<string[]>([text]);

  const measure = useCallback(() => {
    const probe = probeRef.current;
    if (!probe) return;
    const words = Array.from(probe.querySelectorAll<HTMLSpanElement>("[data-word]"));
    const grouped: string[] = [];
    let currentTop: number | null = null;
    let current: string[] = [];
    for (const word of words) {
      const top = word.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) > 2) {
        if (current.length) grouped.push(current.join(" "));
        current = [word.textContent ?? ""];
        currentTop = top;
      } else {
        current.push(word.textContent ?? "");
      }
    }
    if (current.length) grouped.push(current.join(" "));
    setLines(grouped.length ? grouped : [text]);
  }, [text]);

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps]);

  useEffect(() => {
    const probe = probeRef.current;
    if (!probe) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(probe);
    return () => observer.disconnect();
  }, [measure]);

  return { probeRef, lines };
}

function Statement({
  statement,
  direction,
  className,
}: {
  statement: RevealStatement;
  direction: 1 | -1;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { probeRef, lines } = useMeasuredLines(statement.text, [statement.id]);
  const words = statement.text.split(/\s+/);

  return (
    <div className="relative">
      <p
        ref={probeRef}
        aria-hidden
        className={cn("pointer-events-none invisible absolute inset-x-0 top-0", className)}
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} data-word className="inline-block">
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      <blockquote className={className}>
        {lines.map((line, index) => (
          <span key={`${statement.id}-${index}`} className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="block will-change-transform"
              initial={reduced ? { opacity: 0 } : { y: `${110 * direction}%`, opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: `${-110 * direction}%`, opacity: 0 }}
              transition={{
                duration: reduced ? 0.2 : 0.9,
                delay: reduced ? 0 : index * 0.08,
                ease: EASE,
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
        {statement.attribution ? (
          <motion.footer
            className="mt-6 text-sm text-[color:var(--text-muted)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: reduced ? 0 : lines.length * 0.08 + 0.2 }}
          >
            {statement.attribution}
          </motion.footer>
        ) : null}
      </blockquote>
    </div>
  );
}

export function LineReveal({
  statements,
  interval = 6000,
  className,
  textClassName,
  label = "Statements",
}: {
  statements: RevealStatement[];
  interval?: number;
  className?: string;
  textClassName?: string;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const count = statements.length;

  const go = useCallback(
    (next: number, dir: 1 | -1) => {
      if (count === 0) return;
      setDirection(dir);
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const timer = window.setInterval(() => go(index + 1, 1), interval);
    return () => window.clearInterval(timer);
  }, [paused, reduced, count, interval, index, go]);

  if (count === 0) return null;
  const current = statements[index];

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (start === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(delta) < 40) return;
        go(index + (delta < 0 ? 1 : -1), delta < 0 ? 1 : -1);
      }}
    >
      <div className="min-h-[7.5em]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <Statement
            key={current.id}
            statement={current}
            direction={direction}
            className={cn("font-display text-display-md text-balance text-[color:var(--text-primary)]", textClassName)}
          />
        </AnimatePresence>
      </div>

      {count > 1 ? (
        <div className="mt-10 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2" role="tablist" aria-label={`${label} navigation`}>
            {statements.map((statement, i) => (
              <button
                key={statement.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Statement ${i + 1} of ${count}`}
                onClick={() => go(i, i > index ? 1 : -1)}
                className={cn(
                  "h-1.5 rounded-full transition-[width,background-color] duration-500",
                  i === index
                    ? "w-8 bg-[color:var(--accent)]"
                    : "w-3 bg-[color:var(--hairline-strong)] hover:bg-[color:var(--text-muted)]",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(index - 1, -1)}
              aria-label="Previous statement"
              className="grid size-11 place-items-center rounded-full border border-[color:var(--hairline-strong)] text-[color:var(--text-secondary)] transition-colors hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1, 1)}
              aria-label="Next statement"
              className="grid size-11 place-items-center rounded-full border border-[color:var(--hairline-strong)] text-[color:var(--text-secondary)] transition-colors hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
