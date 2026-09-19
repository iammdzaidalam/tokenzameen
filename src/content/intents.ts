import type { Intent } from "@/types/catalog";

export const intents: Intent[] = [
  {
    slug: "buy-a-home",
    title: "Buy a Home",
    description: "Find a place to call home.",
    categories: ["apartments", "villas", "sustainable-living"],
    purposes: ["self-use"],
  },
  {
    slug: "second-home",
    title: "Find a Second Home",
    description: "Own your escape.",
    categories: ["villas", "plots", "spiritual-residences", "sustainable-living"],
    purposes: ["second-home", "self-use"],
  },
  {
    slug: "rental-income",
    title: "Generate Rental Income",
    description: "Explore income-oriented properties.",
    categories: ["commercial", "apartments"],
    purposes: ["rental-income", "commercial-income"],
  },
  {
    slug: "buy-commercial",
    title: "Buy Commercial",
    description: "Explore commercial real estate.",
    categories: ["commercial"],
    purposes: ["commercial-income", "investment"],
  },
  {
    slug: "own-land",
    title: "Own Land",
    description: "Acquire land for tomorrow.",
    categories: ["plots"],
    purposes: ["land-banking", "capital-appreciation"],
  },
  {
    slug: "live-differently",
    title: "Live Differently",
    description: "Explore sustainable and spiritual residences.",
    categories: ["sustainable-living", "spiritual-residences"],
    purposes: ["self-use", "second-home"],
  },
];

export const intentBySlug = new Map(intents.map((i) => [i.slug, i]));
