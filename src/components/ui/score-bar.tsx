"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

export function ScoreBar({
  label,
  value,
  max = 10,
  accent = "gold",
  delay = 0,
}: {
  label: string;
  value: number;
  max?: number;
  accent?: "gold" | "sage" | "lotus";
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const pct = Math.max(0, Math.min(1, value / max));
  const segments = 10;
  const filled = Math.round(pct * segments);

  const accentClass = {
    gold: "bg-gold-400",
    sage: "bg-sage-400",
    lotus: "bg-lotus-400",
  }[accent];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-subhead text-sm text-[color:var(--text-secondary)]">{label}</span>
        <span className="tabular text-xs text-[color:var(--text-muted)]">
          {value}/{max}
        </span>
      </div>
      <div className="flex gap-1" role="img" aria-label={`${label}: ${value} out of ${max}`}>
        {Array.from({ length: segments }, (_, i) => (
          <motion.span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < filled ? accentClass : "bg-white/10",
            )}
            initial={reduced ? false : { opacity: 0, scaleX: 0.2 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.4, delay: delay + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left" }}
          />
        ))}
      </div>
    </div>
  );
}
