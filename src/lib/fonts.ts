import localFont from "next/font/local";
import { Inter } from "next/font/google";

/**
 * The brief specifies PP Neue Machina for display and Neue Montreal for
 * subheadings. Both are paid Pangram Pangram releases, so Clash Display and
 * Switzer stand in — self-hosted variable faces under the ITF Free Font License,
 * which permits commercial use and @font-face self-hosting (src/fonts/FONTSHARE-ITF-FREE-FONT-LICENSE.txt).
 * That licence forbids subsetting and format conversion, so the woff2 files ship
 * exactly as distributed. When the Pangram Pangram licences are bought, swap the
 * two `src` paths below and nothing else changes.
 */
export const displayFont = localFont({
  src: [{ path: "../fonts/ClashDisplay-Variable.woff2", weight: "200 700", style: "normal" }],
  variable: "--font-display",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const subheadFont = localFont({
  src: [
    { path: "../fonts/Switzer-Variable.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/Switzer-VariableItalic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-subhead",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontVariables = [
  displayFont.variable,
  subheadFont.variable,
  bodyFont.variable,
].join(" ");
