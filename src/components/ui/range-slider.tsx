"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Two native range inputs stacked on one track. Native inputs keep keyboard and
 * screen-reader behaviour intact; pointer-events are routed to whichever thumb is
 * nearer the cursor so the overlapping tracks stay usable.
 */
export function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  minLabel,
  maxLabel,
  className,
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
  formatValue: (value: number) => string;
  minLabel: string;
  maxLabel: string;
  className?: string;
}) {
  const [lower, upper] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<"lower" | "upper">("lower");

  const pct = useCallback((v: number) => ((v - min) / (max - min)) * 100, [min, max]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (rect.width === 0) return;
      const ratio = (event.clientX - rect.left) / rect.width;
      const position = min + ratio * (max - min);
      setActive(Math.abs(position - lower) <= Math.abs(position - upper) ? "lower" : "upper");
    },
    [lower, upper, min, max],
  );

  useEffect(() => {
    if (lower > upper) onChange([upper, lower]);
  }, [lower, upper, onChange]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        ref={trackRef}
        className="relative h-9"
        onPointerMove={handlePointerMove}
      >
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gold-400"
          style={{ left: `${pct(lower)}%`, right: `${100 - pct(upper)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lower}
          aria-label={minLabel}
          onChange={(e) => onChange([Math.min(Number(e.target.value), upper), upper])}
          onFocus={() => setActive("lower")}
          className={cn("range-thumb absolute inset-0 w-full", active === "lower" ? "z-20" : "z-10")}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={upper}
          aria-label={maxLabel}
          onChange={(e) => onChange([lower, Math.max(Number(e.target.value), lower)])}
          onFocus={() => setActive("upper")}
          className={cn("range-thumb absolute inset-0 w-full", active === "upper" ? "z-20" : "z-10")}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="tabular text-[color:var(--text-primary)]">{formatValue(lower)}</span>
        <span aria-hidden className="text-steel-500">
          —
        </span>
        <span className="tabular text-[color:var(--text-primary)]">
          {upper >= max ? `${formatValue(max)}+` : formatValue(upper)}
        </span>
      </div>
    </div>
  );
}
