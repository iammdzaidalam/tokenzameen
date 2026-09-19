import { categories } from "@/content/categories";
import { intents } from "@/content/intents";

export const purchaseLinks = [
  { href: "/purchase/properties", label: "All Properties", description: "The full collection" },
  ...categories.map((category) => ({
    href: `/purchase/${category.slug}`,
    label: category.name,
    description: category.tagline,
  })),
];

export const discoverLinks = intents.map((intent) => ({
  href: `/discover/${intent.slug}`,
  label: intent.title,
  description: intent.description,
}));

export const primaryNav = [
  { href: "/purchase", label: "Purchase", panel: "purchase" as const },
  { href: "/discover", label: "Discover", panel: "discover" as const },
  { href: "/verified", label: "Verified", panel: null },
  { href: "/advisory", label: "Advisory", panel: null },
];
