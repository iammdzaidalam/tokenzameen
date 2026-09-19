"use client";

import { Heart, Scale } from "lucide-react";
import { useShortlist } from "@/components/providers/shortlist-provider";

export function ShortlistSummary() {
  const { ready, saved, compare } = useShortlist();

  if (!ready || (saved.length === 0 && compare.length === 0)) return null;

  return (
    <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[color:var(--text-secondary)]">
      {saved.length > 0 ? (
        <span className="inline-flex items-center gap-2">
          <Heart className="size-4 text-gold-300" aria-hidden />
          <span className="tabular text-[color:var(--text-primary)]">{saved.length}</span>
          {saved.length === 1 ? "property saved" : "properties saved"}
        </span>
      ) : null}
      {compare.length > 0 ? (
        <span className="inline-flex items-center gap-2">
          <Scale className="size-4 text-gold-300" aria-hidden />
          <span className="tabular text-[color:var(--text-primary)]">{compare.length}</span>
          in comparison
        </span>
      ) : null}
    </p>
  );
}
