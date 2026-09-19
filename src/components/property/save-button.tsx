"use client";

import { Heart } from "lucide-react";
import { useShortlist } from "@/components/providers/shortlist-provider";
import { cn } from "@/lib/cn";

export function SaveButton({
  slug,
  name,
  className,
  tone = "glass",
}: {
  slug: string;
  name: string;
  className?: string;
  tone?: "glass" | "bare";
}) {
  const { isSaved, toggleSaved, ready } = useShortlist();
  const saved = ready && isSaved(slug);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleSaved(slug);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`}
      className={cn(
        "grid size-9 place-items-center rounded-full transition-colors duration-300",
        tone === "glass"
          ? "glass text-bone-100 hover:text-gold-200"
          : "border border-[color:var(--hairline-strong)] text-[color:var(--text-secondary)] hover:text-[color:var(--accent)]",
        saved && "text-gold-300",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-transform duration-300", saved && "scale-110 fill-current")} />
    </button>
  );
}
