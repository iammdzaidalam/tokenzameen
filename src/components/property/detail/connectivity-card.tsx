import {
  GraduationCap,
  Hospital,
  Landmark,
  Plane,
  Route,
  Store,
  TrainFront,
} from "lucide-react";
import type { ConnectivityPoint } from "@/types/catalog";

const ICONS: Record<ConnectivityPoint["kind"], React.ComponentType<{ className?: string }>> = {
  metro: TrainFront,
  airport: Plane,
  hospital: Hospital,
  school: GraduationCap,
  market: Store,
  highway: Route,
  landmark: Landmark,
};

const KIND_LABEL: Record<ConnectivityPoint["kind"], string> = {
  metro: "Metro",
  airport: "Airport",
  hospital: "Hospital",
  school: "School",
  market: "Market",
  highway: "Highway",
  landmark: "Landmark",
};

function distanceLabel(point: ConnectivityPoint): string {
  if (point.minutes !== null && point.distanceKm !== null) {
    return `${point.minutes} min · ${point.distanceKm} km`;
  }
  if (point.minutes !== null) return `${point.minutes} min`;
  if (point.distanceKm !== null) return `${point.distanceKm} km`;
  return "Distance on request";
}

export function ConnectivityCard({ point }: { point: ConnectivityPoint }) {
  const Icon = ICONS[point.kind];
  const measured = point.minutes !== null || point.distanceKm !== null;

  return (
    <div className="flex items-center gap-4 rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] p-4">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-full border border-[color:var(--hairline-strong)] text-[color:var(--accent)]"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-[color:var(--text-muted)]">{KIND_LABEL[point.kind]}</p>
        <p className="mt-1.5 truncate text-sm text-[color:var(--text-primary)]">{point.label}</p>
      </div>
      <p
        className={
          measured
            ? "tabular shrink-0 text-sm text-[color:var(--text-primary)]"
            : "shrink-0 text-xs text-[color:var(--text-muted)]"
        }
      >
        {distanceLabel(point)}
      </p>
    </div>
  );
}
