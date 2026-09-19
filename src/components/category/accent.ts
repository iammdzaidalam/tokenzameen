import type { Category } from "@/types/catalog";

export type Accent = Category["accent"];
export type Tone = "dark" | "light";

/**
 * `--accent` is redefined by `[data-surface="light"]`, so a category accent that
 * is not gold cannot ride on the variable. These maps carry a tone-matched class
 * per accent instead; pick the entry for the tone of the section you are in.
 */
const TEXT: Record<Accent, Record<Tone, string>> = {
  gold: { dark: "text-gold-400", light: "text-gold-600" },
  sage: { dark: "text-sage-400", light: "text-sage-500" },
  lotus: { dark: "text-lotus-400", light: "text-lotus-500" },
  steel: { dark: "text-steel-300", light: "text-steel-500" },
};

const RULE: Record<Accent, Record<Tone, string>> = {
  gold: { dark: "bg-gold-400/45", light: "bg-gold-600/45" },
  sage: { dark: "bg-sage-400/45", light: "bg-sage-500/45" },
  lotus: { dark: "bg-lotus-400/45", light: "bg-lotus-500/45" },
  steel: { dark: "bg-steel-300/45", light: "bg-steel-500/45" },
};

const BORDER: Record<Accent, Record<Tone, string>> = {
  gold: { dark: "border-gold-400/30", light: "border-gold-600/30" },
  sage: { dark: "border-sage-400/30", light: "border-sage-500/30" },
  lotus: { dark: "border-lotus-400/30", light: "border-lotus-500/30" },
  steel: { dark: "border-steel-300/30", light: "border-steel-500/30" },
};

const WASH: Record<Accent, string> = {
  gold: "from-gold-500/25",
  sage: "from-sage-500/25",
  lotus: "from-lotus-500/25",
  steel: "from-steel-500/25",
};

const BADGE: Record<Accent, "gold" | "sage" | "lotus" | "neutral"> = {
  gold: "gold",
  sage: "sage",
  lotus: "lotus",
  steel: "neutral",
};

export function accentText(accent: Accent, tone: Tone = "dark"): string {
  return TEXT[accent][tone];
}

export function accentRule(accent: Accent, tone: Tone = "dark"): string {
  return RULE[accent][tone];
}

export function accentBorder(accent: Accent, tone: Tone = "dark"): string {
  return BORDER[accent][tone];
}

export function accentWash(accent: Accent): string {
  return WASH[accent];
}

export function accentBadgeTone(accent: Accent) {
  return BADGE[accent];
}
