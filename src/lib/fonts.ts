import { Inter, Manrope, Space_Grotesk } from "next/font/google";

// PP Neue Machina and Neue Montreal are commercially licensed and cannot be fetched
// at build time. Space Grotesk and Manrope stand in for them. To swap in the licensed
// files, drop the woff2 into src/fonts/ and replace these two calls with next/font/local
// using the same CSS variable names — nothing else in the codebase needs to change.
export const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const subheadFont = Manrope({
  subsets: ["latin"],
  variable: "--font-subhead",
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
