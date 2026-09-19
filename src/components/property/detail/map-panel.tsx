import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LocationInfo } from "@/types/catalog";

export function MapPanel({ location }: { location: LocationInfo }) {
  const coordinates = location.coordinates;

  return (
    <div className="relative isolate flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-panel border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] p-6 sm:min-h-[26rem] sm:p-8">
      <svg
        aria-hidden
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 -z-10 size-full text-[color:var(--accent)] opacity-[0.18]"
      >
        <defs>
          <pattern id="tz-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#tz-map-grid)" />
        <circle cx="200" cy="150" r="30" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="200" cy="150" r="66" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="200" cy="150" r="104" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="200" cy="150" r="4" fill="currentColor" />
      </svg>

      <div className="max-w-md">
        <p className="flex items-center gap-2 text-sm text-[color:var(--text-primary)]">
          <MapPin aria-hidden className="size-4 text-[color:var(--accent)]" />
          {location.label}
        </p>

        {coordinates ? (
          <>
            <p className="tabular mt-3 text-xs text-[color:var(--text-secondary)]">
              {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
            </p>
            <Button
              href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="sm"
              className="mt-5"
            >
              <Navigation aria-hidden className="size-3.5" />
              Open the surveyed position
            </Button>
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
            The plotted map is published once the site has been surveyed and the coordinates
            verified. The graphic above is a design device, not a map of this project.
          </p>
        )}
      </div>
    </div>
  );
}
