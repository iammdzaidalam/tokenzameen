"use client";

import { Heart } from "lucide-react";
import { enquiryHref, siteVisitHref } from "@/components/discovery/advisory";
import { CompareButton } from "@/components/property/compare-button";
import { PropertyCard } from "@/components/property/property-card";
import { useShortlist } from "@/components/providers/shortlist-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

function resolve(projects: Project[], slugs: string[]): Project[] {
  return slugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is Project => Boolean(project));
}

export function ShortlistExperience({ projects }: { projects: Project[] }) {
  const { ready, saved, viewed, toggleSaved } = useShortlist();

  const savedProjects = ready ? resolve(projects, saved) : [];
  const viewedProjects = ready ? resolve(projects, viewed) : [];

  return (
    <Section tone="darker" space="none" className="pb-24 pt-28">
      <Container width="wide">
        <Eyebrow withRule>Saved</Eyebrow>
        <h1 className="mt-5 text-display-lg">My Shortlist</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
          Your shortlist is stored in this browser only. It will not follow you to another device, a
          private window, or survive clearing site data.
        </p>

        {!ready ? (
          <p className="mt-10 text-sm text-[color:var(--text-secondary)]">Loading your shortlist…</p>
        ) : savedProjects.length === 0 ? (
          <div className="mt-10 rounded-panel border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] p-8 sm:p-12">
            <span className="grid size-11 place-items-center rounded-full border border-[color:var(--hairline-strong)] text-[color:var(--accent)]">
              <Heart className="size-5" />
            </span>
            <h2 className="mt-6 text-display-sm">Nothing saved yet.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Tap the heart on any property and it will wait for you here, ready to compare or send
              to an advisor.
            </p>
            <Button href="/purchase/properties" size="sm" className="mt-6">
              Browse the collection
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-[color:var(--text-secondary)]">
              <span className="tabular text-[color:var(--text-primary)]">
                {savedProjects.length}
              </span>{" "}
              {savedProjects.length === 1 ? "property saved" : "properties saved"}
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {savedProjects.map((project, index) => (
                <li key={project.slug} className="flex flex-col gap-3">
                  <PropertyCard project={project} priority={index < 2} />
                  <div className="flex flex-wrap items-center gap-2">
                    <CompareButton slug={project.slug} name={project.name} withLabel />
                    <Button href={enquiryHref(project.slug)} variant="secondary" size="sm">
                      Request Details
                    </Button>
                    <Button href={siteVisitHref(project.slug)} variant="ghost" size="sm">
                      Site Visit
                    </Button>
                    <button
                      type="button"
                      onClick={() => toggleSaved(project.slug)}
                      className="ml-auto text-xs text-[color:var(--text-muted)] underline-offset-4 transition-colors hover:text-[color:var(--text-primary)] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {viewedProjects.length > 0 ? (
          <section className="mt-20 border-t border-[color:var(--hairline)] pt-10" aria-label="Recently viewed">
            <h2 className="font-display text-display-sm">Recently viewed</h2>
            <ul className="no-scrollbar -mx-5 mt-6 flex gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
              {viewedProjects.map((project) => (
                <li key={project.slug} className="w-[19rem] shrink-0">
                  <PropertyCard project={project} variant="compact" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </Section>
  );
}
