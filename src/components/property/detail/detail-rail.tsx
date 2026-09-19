"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { RequestButton } from "@/components/property/detail/request-context";
import { DETAIL_SECTIONS, type DetailSectionId } from "@/components/property/detail/sections";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { formatPriceFrom } from "@/lib/format";
import type { Project } from "@/types/catalog";

const PROBE_OFFSET = 168;

export function DetailRail({ project }: { project: Project }) {
  const [active, setActive] = useState<DetailSectionId>(DETAIL_SECTIONS[0].id);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const hero = document.getElementById("hero");
      setPastHero(hero ? hero.getBoundingClientRect().bottom < PROBE_OFFSET : true);

      let current: DetailSectionId = DETAIL_SECTIONS[0].id;
      for (const section of DETAIL_SECTIONS) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= PROBE_OFFSET) current = section.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      data-surface="light"
      className="sticky top-[72px] z-[80] border-b border-[color:var(--hairline)] bg-bone-100/92 text-[color:var(--text-primary)] backdrop-blur-xl"
    >
      <Container width="wide" className="flex items-center gap-6">
        <nav aria-label="Property sections" className="no-scrollbar -mx-1 flex-1 overflow-x-auto">
          <ul className="flex items-center gap-1 px-1 py-2.5">
            {DETAIL_SECTIONS.map((section) => {
              const isActive = active === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "block whitespace-nowrap rounded-full px-3.5 py-2 text-[0.8125rem] transition-colors duration-300",
                      isActive
                        ? "bg-[color:var(--surface-sunken)] text-[color:var(--text-primary)]"
                        : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                    )}
                  >
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "hidden shrink-0 items-center gap-4 transition-opacity duration-500 ease-[var(--ease-luxe)] lg:flex",
            pastHero ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          inert={!pastHero}
        >
          <p className="tabular hidden text-sm text-[color:var(--accent)] xl:block">
            {formatPriceFrom(project.priceFrom)}
          </p>
          <RequestButton subject="the full project details" variant="solid" size="sm">
            Request Details
          </RequestButton>
          <Button href="#site-visit" variant="secondary" size="sm">
            <CalendarClock aria-hidden className="size-3.5" />
            Schedule Site Visit
          </Button>
        </div>
      </Container>
    </div>
  );
}
