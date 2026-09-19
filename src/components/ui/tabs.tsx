"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function Tabs({
  items,
  label = "Collection",
  className,
  panelClassName,
}: {
  items: TabItem[];
  label?: string;
  className?: string;
  panelClassName?: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const baseId = useId();
  const active = items.find((item) => item.id === activeId) ?? items[0];

  if (!active) return null;

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className="inline-flex gap-1 rounded-full border border-[color:var(--hairline)] p-1"
      >
        {items.map((item) => {
          const selected = item.id === active.id;
          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm transition-colors",
                selected ? "text-[color:var(--surface)]" : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId={`${baseId}-tab-indicator`}
                  className="absolute inset-0 rounded-full bg-[color:var(--text-primary)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div
        id={`${baseId}-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.id}`}
        className={cn("mt-8", panelClassName)}
      >
        {active.content}
      </div>
    </div>
  );
}
