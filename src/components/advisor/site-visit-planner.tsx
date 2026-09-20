"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteVisitForm, type PropertyOption } from "@/components/forms";
import { cn } from "@/lib/cn";
import {
  MAX_VISIT_LEAD_DAYS,
  VISIT_SLOT_LABEL,
  VISIT_SLOT_VALUES,
  addDaysToIsoDate,
  todayInIndia,
  type VisitSlot,
} from "@/lib/validation";
import { readFormField, writeFormField } from "./form-bridge";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
const dayLabel = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const fullDayLabel = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

function shiftMonth(month: string, by: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  return toIso(new Date(Date.UTC(year, monthIndex - 1 + by, 1))).slice(0, 7);
}

function monthCells(month: string): Array<string | null> {
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7;
  const cells: Array<string | null> = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toIso(new Date(Date.UTC(year, monthIndex - 1, day))));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export interface SiteVisitPlannerProps {
  projectSlug?: string | null;
  projectName?: string | null;
  properties?: PropertyOption[];
  className?: string;
}

/**
 * Board 02's booking treatment — a calendar of day cells with a legend and
 * time-slot pills — wrapped around the shared `SiteVisitForm`. The planner
 * writes into the form's own `preferredDate` and `preferredTime` controls, so
 * validation, submission and the confirmation copy stay in one place.
 */
export function SiteVisitPlanner({ projectSlug, projectName, properties, className }: SiteVisitPlannerProps) {
  const root = useRef<HTMLDivElement>(null);
  const [today] = useState(() => todayInIndia());
  const latest = addDaysToIsoDate(today, MAX_VISIT_LEAD_DAYS);
  const [month, setMonth] = useState(() => monthOf(today));
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<VisitSlot | "">("");

  useEffect(() => {
    if (date) writeFormField(root.current, "preferredDate", date);
  }, [date]);

  useEffect(() => {
    writeFormField(root.current, "preferredTime", slot);
  }, [slot]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const sync = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return;
      if (target.name === "preferredDate") {
        const value = readFormField(node, "preferredDate");
        if (value && value >= today && value <= latest) {
          setDate(value);
          setMonth(monthOf(value));
        }
      }
      if (target.name === "preferredTime") {
        const value = readFormField(node, "preferredTime") ?? "";
        setSlot((VISIT_SLOT_VALUES as readonly string[]).includes(value) ? (value as VisitSlot) : "");
      }
    };
    node.addEventListener("change", sync);
    return () => node.removeEventListener("change", sync);
  }, [today, latest]);

  const cells = monthCells(month);
  const canGoBack = month > monthOf(today);
  const canGoForward = month < monthOf(latest);
  const monthDate = new Date(`${month}-01T00:00:00Z`);

  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );

  const bookableDays = cells.filter(
    (cell): cell is string => cell !== null && cell >= today && cell <= latest,
  );
  const tabbableDay = date !== null && bookableDays.includes(date) ? date : bookableDays[0];

  const onDayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, cell: string) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const index = bookableDays.indexOf(cell);
    const next = bookableDays[Math.min(Math.max(index + step, 0), bookableDays.length - 1)];
    if (!next) return;
    setDate(next);
    const container = event.currentTarget.closest('[role="grid"]');
    const target = container?.querySelector<HTMLButtonElement>(
      `button[aria-label^="${fullDayLabel.format(new Date(`${next}T00:00:00Z`))}"]`,
    );
    target?.focus();
  };

  return (
    <div ref={root} className={cn("grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12", className)}>
      <div>
        <div className="rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMonth((current) => shiftMonth(current, -1))}
              disabled={!canGoBack}
              aria-label="Previous month"
              className="grid size-9 place-items-center rounded-full border border-[color:var(--hairline)] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)] disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <p className="font-display text-base text-[color:var(--text-primary)]" aria-live="polite">
              {monthLabel.format(monthDate)}
            </p>
            <button
              type="button"
              onClick={() => setMonth((current) => shiftMonth(current, 1))}
              disabled={!canGoForward}
              aria-label="Next month"
              className="grid size-9 place-items-center rounded-full border border-[color:var(--hairline)] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)] disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          <div className="mt-4 text-center" role="grid" aria-label="Choose a visit date">
            <div role="row" className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday} role="columnheader" className="eyebrow py-1 text-[color:var(--text-muted)]">
                  {weekday}
                </span>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div role="row" key={`week-${weekIndex}`} className="mt-1 grid grid-cols-7 gap-1">
                {week.map((cell, index) => {
                  if (!cell) {
                    return <span key={`gap-${weekIndex}-${index}`} role="gridcell" aria-hidden />;
                  }
                  const bookable = cell >= today && cell <= latest;
                  const selected = cell === date;
                  return (
                    <span role="gridcell" key={cell}>
                      <button
                        type="button"
                        disabled={!bookable}
                        aria-pressed={selected}
                        tabIndex={cell === tabbableDay ? 0 : -1}
                        aria-label={`${fullDayLabel.format(new Date(`${cell}T00:00:00Z`))}${bookable ? "" : ", not bookable"}`}
                        onClick={() => setDate(cell)}
                        onKeyDown={(event) => onDayKeyDown(event, cell)}
                        className={cn(
                          "tabular aspect-square w-full rounded-full text-sm transition-colors duration-300",
                          selected
                            ? "bg-[color:var(--text-primary)] text-[color:var(--surface)]"
                            : bookable
                              ? "border border-[color:var(--hairline)] text-[color:var(--text-primary)] hover:border-[color:var(--text-primary)]"
                              : "text-[color:var(--text-muted)] line-through opacity-50",
                          cell === today && !selected && "border-[color:var(--accent)]",
                        )}
                      >
                        {Number(cell.slice(8, 10))}
                      </button>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[color:var(--text-secondary)]" aria-label="Legend">
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-full bg-[color:var(--text-primary)]" />
              Selected
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-full border border-[color:var(--hairline-strong)]" />
              Bookable
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-full border border-[color:var(--accent)]" />
              Today
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-full bg-[color:var(--surface-sunken)] opacity-70" />
              Not bookable
            </li>
          </ul>
        </div>

        <fieldset className="mt-6">
          <legend className="eyebrow text-[color:var(--text-muted)]">Time slot</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {[{ value: "" as const, label: "Any time" }, ...VISIT_SLOT_VALUES.map((value) => ({ value, label: VISIT_SLOT_LABEL[value] }))].map(
              (option) => (
                <button
                  key={option.value || "any"}
                  type="button"
                  aria-pressed={slot === option.value}
                  onClick={() => setSlot(option.value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors duration-300",
                    slot === option.value
                      ? "border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--surface)]"
                      : "border-[color:var(--hairline-strong)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                  )}
                >
                  {option.label}
                </button>
              ),
            )}
          </div>
        </fieldset>

        <p className="mt-6 flex items-start gap-2 text-sm text-[color:var(--text-secondary)]" aria-live="polite">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-[color:var(--accent)]" aria-hidden />
          <span>
            {date
              ? `${dayLabel.format(new Date(`${date}T00:00:00Z`))} · ${slot ? VISIT_SLOT_LABEL[slot] : "any time"}`
              : "Pick a day and a slot. Visits can be requested up to six months ahead."}
          </span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-muted)]">
          Your selection is filled into the form. You can still change the date and time there. An advisor confirms
          the appointment — the request itself is not a confirmed booking.
        </p>
      </div>

      <div className="rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-5 sm:p-7">
        <SiteVisitForm projectSlug={projectSlug} projectName={projectName} properties={properties} />
      </div>
    </div>
  );
}
