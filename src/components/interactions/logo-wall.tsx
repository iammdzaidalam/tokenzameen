"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

export interface WallItem {
  id: string;
  label: string;
  sublabel?: string;
  href?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function pickIndex(exclude: number, length: number, random: () => number) {
  if (length < 2) return 0;
  let next = Math.floor(random() * length);
  while (next === exclude) next = Math.floor(random() * length);
  return next;
}

/**
 * A fixed grid of cells. Every `interval` one cell — never the one that just
 * changed — swaps its item for one not visible anywhere in the grid. Pauses on
 * hover and under reduced motion.
 */
export function LogoWall({
  items,
  cells = 8,
  interval = 2400,
  className,
  cellClassName,
}: {
  items: WallItem[];
  cells?: number;
  interval?: number;
  className?: string;
  cellClassName?: string;
}) {
  const reduced = useReducedMotion();
  const visibleCount = Math.min(cells, items.length);
  const [slots, setSlots] = useState<number[]>(() => Array.from({ length: visibleCount }, (_, i) => i));
  const [paused, setPaused] = useState(false);
  const lastCell = useRef(-1);

  const canCycle = items.length > visibleCount && !reduced && !paused;

  useEffect(() => {
    if (!canCycle) return;
    const timer = window.setInterval(() => {
      setSlots((current) => {
        const cell = pickIndex(lastCell.current, current.length, Math.random);
        lastCell.current = cell;
        const hidden = items.map((_, i) => i).filter((i) => !current.includes(i));
        if (hidden.length === 0) return current;
        const replacement = hidden[Math.floor(Math.random() * hidden.length)];
        const next = [...current];
        next[cell] = replacement;
        return next;
      });
    }, interval);
    return () => window.clearInterval(timer);
  }, [canCycle, interval, items]);

  const grid = useMemo(() => slots.map((itemIndex) => items[itemIndex]).filter(Boolean), [slots, items]);

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-card bg-[color:var(--hairline)] sm:grid-cols-4",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="In the collection"
    >
      {grid.map((item, cell) => (
        <li
          key={cell}
          className={cn(
            "relative aspect-[5/3] overflow-hidden bg-[color:var(--surface)]",
            cellClassName,
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={item.id}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center"
              initial={reduced ? { opacity: 0 } : { y: "60%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: "-60%", opacity: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.7, ease: EASE }}
            >
              {item.href ? (
                <a
                  href={item.href}
                  className="font-display text-lg text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--accent)] sm:text-xl"
                >
                  {item.label}
                </a>
              ) : (
                <span className="font-display text-lg text-[color:var(--text-primary)] sm:text-xl">
                  {item.label}
                </span>
              )}
              {item.sublabel ? (
                <span className="eyebrow text-[color:var(--text-muted)]">{item.sublabel}</span>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </li>
      ))}
    </ul>
  );
}
