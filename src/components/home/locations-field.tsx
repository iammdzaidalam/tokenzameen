"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";

export interface LocationPin {
  id: string;
  label: string;
  x: number;
  y: number;
  projects: Array<{
    slug: string;
    name: string;
    category: string;
    location: string;
    price: string;
    image: string;
    alt: string;
  }>;
}

const RINGS = 9;
const POINTS = 96;

/** Deterministic contour rings, so the server and the client draw the same texture. */
function contourPath(ring: number): string {
  const centreX = 48;
  const centreY = 52;
  const base = 8 + ring * 6.5;
  const parts: string[] = [];
  for (let index = 0; index <= POINTS; index += 1) {
    const theta = (index / POINTS) * Math.PI * 2;
    const radius =
      base +
      Math.sin(theta * 3 + ring * 0.9) * (1.6 + ring * 0.35) +
      Math.cos(theta * 5 - ring * 0.6) * (0.9 + ring * 0.2) +
      Math.sin(theta * 2 + ring) * 1.2;
    const x = centreX + Math.cos(theta) * radius * 1.35;
    const y = centreY + Math.sin(theta) * radius;
    parts.push(`${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${parts.join(" ")}Z`;
}

const CONTOURS = Array.from({ length: RINGS }, (_, ring) => contourPath(ring));

export function LocationsField({ pins }: { pins: LocationPin[] }) {
  const [activeId, setActiveId] = useState<string | null>(pins[0]?.id ?? null);
  const active = pins.find((pin) => pin.id === activeId) ?? pins[0] ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-8">
      <div className="relative aspect-[4/3] overflow-hidden rounded-panel border border-[color:var(--hairline)] bg-carbon-900 sm:aspect-[16/10]">
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          {CONTOURS.map((d, index) => (
            <path
              key={d.slice(0, 12) + index}
              d={d}
              fill="none"
              stroke="rgba(245,243,238,0.09)"
              strokeWidth={0.25}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_60%_at_40%_50%,rgba(201,169,97,0.08),transparent_70%)]"
        />

        <ul className="absolute inset-0" aria-label="Locations in the collection">
          {pins.map((pin) => {
            const isActive = pin.id === active?.id;
            return (
              <li
                key={pin.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveId(pin.id)}
                  onMouseEnter={() => setActiveId(pin.id)}
                  onFocus={() => setActiveId(pin.id)}
                  className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors duration-300"
                >
                  <span className="relative grid size-6 place-items-center">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-0 rounded-full bg-gold-400/25 transition-transform duration-700 ease-[var(--ease-luxe)]",
                        isActive ? "scale-100" : "scale-0 group-hover:scale-100",
                      )}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "relative size-2.5 rounded-full border border-carbon-950 transition-colors duration-300",
                        isActive ? "bg-gold-400" : "bg-bone-200 group-hover:bg-gold-300",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-xs transition-colors duration-300 sm:text-sm",
                      isActive ? "text-bone-50" : "text-steel-300 group-hover:text-bone-100",
                    )}
                  >
                    {pin.label}
                    <span className="sr-only">
                      , {pin.projects.length} {pin.projects.length === 1 ? "property" : "properties"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {active ? (
          <div
            data-surface="light"
            className="absolute bottom-4 left-4 right-4 rounded-card bg-white p-4 text-carbon-900 shadow-lift sm:left-auto sm:w-80 lg:hidden"
            aria-live="polite"
          >
            <ActiveCard pin={active} compact />
          </div>
        ) : null}
      </div>

      <div className="hidden lg:block" aria-live="polite">
        {active ? (
          <div data-surface="light" className="rounded-card bg-white p-5 text-carbon-900 shadow-lift">
            <ActiveCard pin={active} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActiveCard({ pin, compact = false }: { pin: LocationPin; compact?: boolean }) {
  const shown = compact ? pin.projects.slice(0, 1) : pin.projects;
  const hidden = pin.projects.length - shown.length;
  return (
    <>
      <p className="eyebrow flex items-center gap-1.5 text-steel-500">
        <MapPin className="size-3 text-gold-600" aria-hidden />
        {pin.label}
      </p>
      <ul className={cn("mt-3 divide-y divide-[color:var(--hairline)]", compact && "mt-2")}>
        {shown.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/purchase/${project.slug}`}
              className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-bone-200">
                <Image src={project.image} alt={project.alt} fill sizes="48px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-sm">{project.name}</span>
                <span className="block truncate text-xs text-carbon-500">
                  {project.category} · {project.price}
                </span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-steel-400 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-600" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <p className="mt-2 text-xs text-carbon-500">
          +{hidden} more at this location
        </p>
      ) : null}
    </>
  );
}
