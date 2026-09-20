"use client";

import { useState } from "react";
import { Check, Scale } from "lucide-react";
import { MAX_COMPARE, useShortlist } from "@/components/providers/shortlist-provider";
import { cn } from "@/lib/cn";

export function CompareButton({
  slug,
  name,
  className,
  withLabel = false,
}: {
  slug: string;
  name: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { isComparing, toggleCompare, ready } = useShortlist();
  const [rejected, setRejected] = useState(false);
  const comparing = ready && isComparing(slug);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const accepted = toggleCompare(slug);
        if (!accepted) {
          setRejected(true);
          window.setTimeout(() => setRejected(false), 2400);
        }
      }}
      aria-pressed={comparing}
      aria-label={comparing ? `Remove ${name} from comparison` : `Add ${name} to comparison`}
      title={rejected ? `Comparison holds up to ${MAX_COMPARE} properties` : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors duration-300",
        comparing
          ? "border-[color:var(--accent)] bg-[color:var(--surface-sunken)] text-[color:var(--accent)]"
          : "border-[color:var(--hairline-strong)] text-[color:var(--text-secondary)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
        rejected && "border-signal-warning/60 text-signal-warning",
        className,
      )}
    >
      {comparing ? <Check className="size-3.5" /> : <Scale className="size-3.5" />}
      {withLabel ? <span>{rejected ? `Max ${MAX_COMPARE}` : comparing ? "Comparing" : "Compare"}</span> : null}
    </button>
  );
}
