import { BadgeCheck, CircleCheck, Clock, Hourglass, ShieldCheck } from "lucide-react";
import { Panel } from "@/components/property/detail/detail-primitives";
import { formatDate } from "@/lib/format";
import type { Project, VerifiedFacets } from "@/types/catalog";

const FACET_LABEL: Record<keyof VerifiedFacets, string> = {
  project: "Property information",
  developer: "Developer information",
  location: "Location",
  documentation: "Documentation",
  pricing: "Pricing",
  inventory: "Inventory",
};

const FACET_ORDER: Array<keyof VerifiedFacets> = [
  "project",
  "developer",
  "location",
  "documentation",
  "pricing",
  "inventory",
];

export function TrustPanel({ project }: { project: Project }) {
  return (
    <Panel className="flex flex-col gap-7">
      <div className="flex items-center gap-3">
        <ShieldCheck aria-hidden className="size-5 text-[color:var(--accent)]" />
        <h3 className="font-subhead text-base font-medium text-[color:var(--text-primary)]">
          Verified information
        </h3>
      </div>

      <ul className="flex flex-col gap-3">
        {FACET_ORDER.map((facet) => {
          const verified = project.verified[facet];
          return (
            <li key={facet} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2.5 text-[color:var(--text-primary)]">
                {verified ? (
                  <CircleCheck aria-hidden className="size-4 text-signal-success" />
                ) : (
                  <Clock aria-hidden className="size-4 text-[color:var(--text-muted)]" />
                )}
                {FACET_LABEL[facet]}
              </span>
              <span
                className={
                  verified
                    ? "text-xs text-[color:var(--accent)]"
                    : "text-xs text-[color:var(--text-muted)]"
                }
              >
                {verified ? "Verified" : "In progress"}
              </span>
            </li>
          );
        })}
      </ul>

      <dl className="flex flex-col gap-4 border-t border-[color:var(--hairline)] pt-6 text-sm">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[color:var(--text-muted)]">Developer</dt>
          <dd className="text-right text-[color:var(--text-primary)]">
            {project.developer ? project.developer.name : "Details on request"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[color:var(--text-muted)]">RERA</dt>
          <dd className="text-right text-[color:var(--text-primary)]">
            {project.reraNumber ?? "RERA details on request"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[color:var(--text-muted)]">Possession</dt>
          <dd className="text-right text-[color:var(--text-primary)]">
            {project.possession ?? "On request"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[color:var(--text-muted)]">Last updated</dt>
          <dd className="tabular text-right text-[color:var(--text-primary)]">
            {formatDate(project.lastUpdated)}
          </dd>
        </div>
      </dl>

      <p className="flex items-start gap-2.5 border-t border-[color:var(--hairline)] pt-6 text-xs leading-relaxed text-[color:var(--text-secondary)]">
        <BadgeCheck aria-hidden className="mt-px size-4 shrink-0 text-[color:var(--accent)]" />
        A TokenZameen advisor supports every enquiry on this property. Anything marked in progress is
        published here the moment it is verified — never estimated in the meantime.
      </p>

      {project.hero.placeholder ? (
        <p className="flex items-start gap-2.5 text-xs leading-relaxed text-[color:var(--text-muted)]">
          <Hourglass aria-hidden className="mt-px size-4 shrink-0" />
          Imagery on this page is representative artwork. Project photography replaces it once the
          developer releases it.
        </p>
      ) : null}
    </Panel>
  );
}
