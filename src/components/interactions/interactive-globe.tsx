"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Map as MapboxMap, Marker as MapboxMarker, StyleSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/hooks";

export interface GlobePin {
  id: string;
  label: string;
  region: string;
  lng: number;
  lat: number;
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

const PANEL_WIDTH = 352;
const INDIA_CENTER: [number, number] = [78.5, 21.5];
const ROTATION_DEGREES_PER_SECOND = 1.6;

/**
 * A minimal style built directly on Mapbox Streets: flat land, darker water,
 * hairline national borders drawn with the Indian worldview, no labels. It
 * matches the carbon band without a Studio style to maintain.
 */
const GLOBE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    composite: { type: "vector", url: "mapbox://mapbox.mapbox-streets-v8" },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#16181c" } },
    {
      id: "water",
      type: "fill",
      source: "composite",
      "source-layer": "water",
      paint: { "fill-color": "#0a0a0c" },
    },
    {
      id: "borders",
      type: "line",
      source: "composite",
      "source-layer": "admin",
      filter: [
        "all",
        ["==", ["get", "admin_level"], 0],
        ["==", ["get", "maritime"], "false"],
        ["match", ["get", "worldview"], ["all", "IN"], true, false],
      ],
      paint: { "line-color": "#3a3f47", "line-width": 0.8 },
    },
  ],
};

function markerElement(label: string, active: boolean) {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.className = "tz-globe-marker";
  button.dataset.active = active ? "true" : "false";
  button.innerHTML =
    '<span class="tz-globe-marker__ring"></span><span class="tz-globe-marker__dot"></span>';
  return button;
}

export function InteractiveGlobe({
  pins,
  token,
  className,
}: {
  pins: GlobePin[];
  token: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 992px)");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, MapboxMarker>>(new Map());
  const rotatingRef = useRef(false);
  const frameRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(pins[0]?.id ?? null);
  const active = useMemo(() => pins.find((pin) => pin.id === activeId) ?? pins[0] ?? null, [pins, activeId]);

  const stopRotation = useCallback(() => {
    rotatingRef.current = false;
    cancelAnimationFrame(frameRef.current);
  }, []);

  const flyTo = useCallback(
    (pin: GlobePin) => {
      const map = mapRef.current;
      if (!map) return;
      stopRotation();
      const options = { center: [pin.lng, pin.lat] as [number, number], zoom: 4.1 };
      if (reduced) map.jumpTo(options);
      else map.flyTo({ ...options, duration: 1500, essential: true });
    },
    [reduced, stopRotation],
  );

  const select = useCallback(
    (pin: GlobePin) => {
      setActiveId(pin.id);
      flyTo(pin);
    },
    [flyTo],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !token) return;
    let disposed = false;
    let map: MapboxMap | null = null;
    const markers = markersRef.current;

    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (disposed) return;
        mapboxgl.accessToken = token;
        map = new mapboxgl.Map({
          container,
          style: GLOBE_STYLE,
          projection: "globe",
          center: INDIA_CENTER,
          zoom: 1.9,
          minZoom: 1.2,
          maxZoom: 6,
          attributionControl: true,
          cooperativeGestures: true,
        });
        mapRef.current = map;

        map.on("style.load", () => {
          map?.setFog({
            color: "#131418",
            "high-color": "#0a0a0c",
            "horizon-blend": 0.04,
            "space-color": "#060607",
            "star-intensity": 0,
          });
        });

        map.on("load", () => {
          if (disposed || !map) return;
          for (const pin of pins) {
            const element = markerElement(`${pin.label} — ${pin.projects.length} in the collection`, pin.id === activeId);
            element.addEventListener("click", () => select(pin));
            const marker = new mapboxgl.Marker({ element, anchor: "center" })
              .setLngLat([pin.lng, pin.lat])
              .addTo(map);
            markers.set(pin.id, marker);
          }
          setReady(true);

          if (!reduced) {
            rotatingRef.current = true;
            let last = performance.now();
            const spin = (now: number) => {
              if (!rotatingRef.current || !map) return;
              const elapsed = (now - last) / 1000;
              last = now;
              const center = map.getCenter();
              map.setCenter([center.lng - ROTATION_DEGREES_PER_SECOND * elapsed, center.lat]);
              frameRef.current = requestAnimationFrame(spin);
            };
            frameRef.current = requestAnimationFrame(spin);
          }
        });

        for (const event of ["mousedown", "touchstart", "wheel", "dragstart"] as const) {
          map.on(event, stopRotation);
        }
        map.on("error", () => setFailed(true));
      } catch {
        setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      stopRotation();
      markers.forEach((marker) => marker.remove());
      markers.clear();
      map?.remove();
      mapRef.current = null;
    };
    // The map is created once; pins and the initial selection are read at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, reduced, stopRotation]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.getElement().dataset.active = id === active?.id ? "true" : "false";
    });
  }, [active]);

  useEffect(() => {
    mapRef.current?.setPadding({ top: 0, bottom: 0, left: 0, right: wide ? PANEL_WIDTH : 0 });
  }, [wide, ready]);

  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!active || pins.length < 2) return;
    const index = pins.findIndex((pin) => pin.id === active.id);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(pins[(index + 1) % pins.length]);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(pins[(index - 1 + pins.length) % pins.length]);
    }
  };

  if (failed) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-panel border border-[color:var(--hairline)] bg-carbon-950", className)}>
      <div
        ref={containerRef}
        className={cn(
          "h-[30rem] w-full transition-opacity duration-700 sm:h-[34rem] lg:h-[38rem]",
          ready ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
      {!ready ? (
        <p className="absolute inset-0 grid place-items-center text-sm text-[color:var(--text-muted)]">
          Loading the globe…
        </p>
      ) : null}

      <div
        role="listbox"
        aria-label="Locations in the collection"
        aria-activedescendant={active ? `globe-option-${active.id}` : undefined}
        tabIndex={0}
        onKeyDown={onListKeyDown}
        className="border-t border-[color:var(--hairline)] bg-carbon-900/90 p-4 backdrop-blur-md lg:absolute lg:inset-y-0 lg:right-0 lg:w-[22rem] lg:border-l lg:border-t-0 lg:overflow-y-auto lg:p-5"
      >
        <p className="eyebrow text-[color:var(--text-muted)]">
          {pins.length} locations · arrow keys to move
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {pins.map((pin) => {
            const isActive = pin.id === active?.id;
            return (
              <li key={pin.id} id={`globe-option-${pin.id}`} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => select(pin)}
                  className={cn(
                    "flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    isActive
                      ? "border-gold-400/50 bg-white/[0.06]"
                      : "border-transparent hover:border-[color:var(--hairline)] hover:bg-white/[0.04]",
                  )}
                >
                  <span>
                    <span className="flex items-center gap-1.5 font-subhead text-sm font-medium text-bone-100">
                      <MapPin className="size-3.5 text-gold-400" />
                      {pin.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-steel-400">
                      {pin.region} · {pin.projects.length} {pin.projects.length === 1 ? "project" : "projects"}
                    </span>
                  </span>
                </button>
                {isActive ? (
                  <ul className="mt-2 flex flex-col gap-2 pl-1">
                    {pin.projects.map((project) => (
                      <li key={project.slug}>
                        <Link
                          href={`/purchase/${project.slug}`}
                          className="group flex items-center gap-3 rounded-xl bg-white p-2 text-carbon-900 shadow-lift"
                        >
                          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-bone-200">
                            <Image src={project.image} alt={project.alt} fill sizes="56px" className="object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-sm">{project.name}</span>
                            <span className="block truncate text-xs text-carbon-500">
                              {project.category} · {project.price}
                            </span>
                          </span>
                          <ArrowUpRight className="size-4 shrink-0 text-steel-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[0.6875rem] leading-relaxed text-steel-500">
          Pins mark the city, not the project site. Exact locations are shared by your advisor.
        </p>
      </div>
    </div>
  );
}
