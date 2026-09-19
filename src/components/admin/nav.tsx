"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Overlay } from "@/components/ui/overlay";
import { cn } from "@/lib/cn";
import { ADMIN_SECTIONS, isActiveSection } from "./nav-items";

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections">
      <ul className="flex flex-col gap-1">
        {ADMIN_SECTIONS.map((section) => {
          const active = isActiveSection(pathname, section.href);
          const Icon = section.icon;
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-300 ease-[var(--ease-luxe)]",
                  active
                    ? "bg-carbon-900 text-bone-100"
                    : "text-[color:var(--text-secondary)] hover:bg-white hover:text-[color:var(--text-primary)]",
                )}
              >
                <span
                  className={cn(
                    "tabular w-6 shrink-0 text-[0.6875rem] font-semibold tracking-[0.14em]",
                    active ? "text-gold-400" : "text-[color:var(--accent)]",
                  )}
                >
                  /{section.index}
                </span>
                <Icon aria-hidden className="size-4 shrink-0" />
                <span className="flex-1">{section.label}</span>
                {section.later ? (
                  <span
                    className={cn(
                      "rounded-full border px-1.5 py-0.5 text-[0.625rem] uppercase tracking-[0.12em]",
                      active
                        ? "border-bone-100/30 text-bone-300"
                        : "border-[color:var(--hairline)] text-[color:var(--text-muted)]",
                    )}
                  >
                    Later
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin sections"
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-full border border-[color:var(--hairline)] text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      >
        <Menu className="size-4" />
      </button>
      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        title="Sections"
        placement="right"
        tone="light"
        labelledBy="admin-mobile-nav"
      >
        <div className="p-4">
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>
      </Overlay>
    </>
  );
}
