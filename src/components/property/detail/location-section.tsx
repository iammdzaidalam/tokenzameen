import { ConnectivityCard } from "@/components/property/detail/connectivity-card";
import { PendingPanel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { MapPanel } from "@/components/property/detail/map-panel";
import { RequestButton } from "@/components/property/detail/request-context";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

const EXPECTED_POINTS = ["Metro", "Airport", "Hospital", "School", "Market"];

export function LocationSection({ project }: { project: Project }) {
  const { location, connectivity } = project;
  const place = [location.region, location.state].filter(Boolean).join(", ");

  return (
    <Section
      id="location"
      tone="dark"
      aria-label={`${project.name} location`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <SectionHeading
          eyebrow="Location"
          title={location.label}
          lead={
            place
              ? `${place}. TokenZameen publishes a distance only once it has been measured against the project’s surveyed position.`
              : "TokenZameen publishes a distance only once it has been measured against the project’s surveyed position."
          }
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <MapPanel location={location} />

          <div className="flex flex-col gap-4">
            {connectivity.length > 0 ? (
              connectivity.map((point) => (
                <ConnectivityCard key={`${point.kind}-${point.label}`} point={point} />
              ))
            ) : (
              <PendingPanel
                title="Verified distances are not published yet"
                body="Travel times and distances for this project have not been measured and confirmed. Rather than publish an estimate you could act on, we hold them back until they are surveyed."
                items={EXPECTED_POINTS}
                itemsLabel="Published once surveyed"
                action={
                  <RequestButton subject="the location pack" variant="primary">
                    Request the location pack
                  </RequestButton>
                }
              />
            )}

            {location.cities.length > 0 ? (
              <div className="rounded-card border border-[color:var(--hairline)] p-4">
                <p className="eyebrow text-[color:var(--text-muted)]">Markets served</p>
                <p className="mt-2 text-sm text-[color:var(--text-primary)]">
                  {location.cities.join(" · ")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
