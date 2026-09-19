import type { CSSProperties } from "react";
import type { Category } from "@/types/catalog";

export type Accent = Category["accent"];
export type Tone = "dark" | "light";

/**
 * `--accent` resolves to gold-600 on bone and paper and to gold-400 on carbon,
 * set by `[data-surface]` on the Section. A category accent (sage, lotus, steel)
 * therefore has to be re-declared *inside* the section: an inline value on a
 * wrapper cascades to IndexLabel, Eyebrow and link buttons beneath it, while a
 * page-level value would be overridden by every section's own surface rule.
 */
const VAR: Record<Accent, Record<Tone, string>> = {
  gold: { dark: "var(--color-gold-400)", light: "var(--color-gold-600)" },
  sage: { dark: "var(--color-sage-400)", light: "var(--color-sage-500)" },
  lotus: { dark: "var(--color-lotus-400)", light: "var(--color-lotus-500)" },
  steel: { dark: "var(--color-steel-300)", light: "var(--color-steel-500)" },
};

const TILE: Record<Accent, string> = {
  gold: "bg-gold-400 text-carbon-950",
  sage: "bg-sage-400 text-carbon-950",
  lotus: "bg-lotus-400 text-carbon-950",
  steel: "bg-steel-200 text-carbon-950",
};

export function accentStyle(accent: Accent, tone: Tone): CSSProperties {
  return { "--accent": VAR[accent][tone] } as CSSProperties;
}

/** Class override for `<TileArrow>` so the circular button carries the category colour. */
export function accentTile(accent: Accent): string {
  return TILE[accent];
}
