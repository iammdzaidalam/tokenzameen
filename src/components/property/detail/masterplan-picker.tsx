"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { MousePointerClick } from "lucide-react";
import { RequestButton } from "@/components/property/detail/request-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatArea, formatMoney } from "@/lib/format";
import { UNIT_STATUS_LABEL } from "@/lib/labels";
import type { MediaAsset, PlotUnit, UnitStatus } from "@/types/catalog";

const REGION_TONE: Record<UnitStatus, string> = {
  available: "border-signal-success/70 bg-signal-success/25 text-bone-100 hover:bg-signal-success/40",
  reserved: "border-signal-warning/70 bg-signal-warning/25 text-bone-100 hover:bg-signal-warning/40",
  sold: "border-white/30 bg-carbon-950/65 text-steel-300 hover:bg-carbon-950/80",
};

const LEGEND_TONE: Record<UnitStatus, string> = {
  available: "border-signal-success/70 bg-signal-success/40",
  reserved: "border-signal-warning/70 bg-signal-warning/40",
  sold: "border-white/30 bg-carbon-950/70",
};

const STATUS_BADGE: Record<UnitStatus, "success" | "warning" | "danger"> = {
  available: "success",
  reserved: "warning",
  sold: "danger",
};

export function MasterplanPicker({
  masterplan,
  plots,
}: {
  masterplan: MediaAsset;
  plots: PlotUnit[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const selected = plots.find((plot) => plot.id === selectedId) ?? null;

  const moveFocus = (from: number, delta: number) => {
    const next = (from + delta + plots.length) % plots.length;
    buttons.current[next]?.focus();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div>
        <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <div className="relative aspect-[14/9] min-w-[34rem] overflow-hidden rounded-panel border border-[color:var(--hairline)] bg-carbon-850">
            <Image
              src={masterplan.src}
              alt={masterplan.alt}
              fill
              sizes="(max-width: 1024px) 90vw, 55vw"
              className="object-fill opacity-90"
            />

            <div
              role="group"
              aria-label="Plot selection"
              className="absolute inset-0"
              onKeyDown={(event) => {
                const index = buttons.current.findIndex((node) => node === document.activeElement);
                if (index < 0) return;
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  moveFocus(index, 1);
                } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  moveFocus(index, -1);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  buttons.current[0]?.focus();
                } else if (event.key === "End") {
                  event.preventDefault();
                  buttons.current[plots.length - 1]?.focus();
                }
              }}
            >
              {plots.map((plot, index) => {
                const plan = plot.plan;
                if (!plan) return null;
                const isSelected = plot.id === selectedId;
                return (
                  <button
                    key={plot.id}
                    ref={(node) => {
                      buttons.current[index] = node;
                    }}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${plot.plotNumber}, ${formatArea(plot.area)}, ${
                      plot.facing ? `${plot.facing} facing, ` : ""
                    }${UNIT_STATUS_LABEL[plot.status]}`}
                    onClick={() => setSelectedId(isSelected ? null : plot.id)}
                    style={{
                      left: `${plan.x}%`,
                      top: `${plan.y}%`,
                      width: `${plan.w}%`,
                      height: `${plan.h}%`,
                    }}
                    className={cn(
                      "absolute grid place-items-center rounded-md border text-[0.625rem] font-medium tracking-wide backdrop-blur-[2px] transition-colors duration-300",
                      REGION_TONE[plot.status],
                      isSelected && "ring-2 ring-gold-400 ring-offset-1 ring-offset-carbon-950",
                    )}
                  >
                    <span aria-hidden>{plot.plotNumber}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Badge tone="outline">Indicative layout</Badge>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {(Object.keys(LEGEND_TONE) as UnitStatus[]).map((status) => (
              <li key={status} className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
                <span aria-hidden className={cn("size-3 rounded-sm border", LEGEND_TONE[status])} />
                {UNIT_STATUS_LABEL[status]}
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
            <MousePointerClick aria-hidden className="size-3.5" />
            Select a plot, or tab through them with the keyboard.
          </p>
        </div>

        {masterplan.caption ? (
          <p className="mt-3 text-xs text-[color:var(--text-muted)]">{masterplan.caption}</p>
        ) : null}
      </div>

      <div
        aria-live="polite"
        className="flex flex-col rounded-panel border border-[color:var(--hairline)] bg-[color:var(--page)] p-6"
      >
        {selected ? (
          <>
            <p className="eyebrow text-[color:var(--text-muted)]">Selected plot</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <h3 className="font-display text-display-sm text-[color:var(--text-primary)]">
                {selected.plotNumber}
              </h3>
              <Badge tone={STATUS_BADGE[selected.status]}>{UNIT_STATUS_LABEL[selected.status]}</Badge>
            </div>

            <dl className="mt-6 flex flex-col gap-4 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Size</dt>
                <dd className="tabular text-[color:var(--text-primary)]">{formatArea(selected.area)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Facing</dt>
                <dd className="text-[color:var(--text-primary)]">{selected.facing ?? "On request"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Price</dt>
                <dd className="tabular text-[color:var(--text-primary)]">{formatMoney(selected.price)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Status</dt>
                <dd className="text-[color:var(--text-primary)]">{UNIT_STATUS_LABEL[selected.status]}</dd>
              </div>
            </dl>

            {selected.sample ? (
              <p className="mt-6 rounded-card border border-dashed border-[color:var(--hairline-strong)] p-3 text-xs leading-relaxed text-[color:var(--text-muted)]">
                Indicative plot. Numbering, dimensions and availability are confirmed against the
                developer’s released inventory.
              </p>
            ) : null}

            <RequestButton
              subject={`availability on plot ${selected.plotNumber}`}
              source="request-price"
              variant="solid"
              className="mt-6"
              full
            >
              Enquire about {selected.plotNumber}
            </RequestButton>
          </>
        ) : (
          <>
            <p className="eyebrow text-[color:var(--text-muted)]">Plot detail</p>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Choose a plot on the plan to see its size, facing and current status. Every plot is also
              listed in the table below, which carries the same information.
            </p>
            <p className="tabular mt-6 text-sm text-[color:var(--text-primary)]">
              {plots.length} plots on the plan
            </p>
          </>
        )}
      </div>
    </div>
  );
}
