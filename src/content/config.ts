/**
 * Indicative inventory demonstrates the masterplan and unit-table interactions
 * before a developer releases a live availability sheet. Every sample row carries
 * `sample: true` and the UI labels it. Flip this to false the moment real
 * inventory lands, or delete the sample rows from src/content/projects.ts.
 */
export const SHOW_SAMPLE_INVENTORY = true;

export const SITE = {
  name: "TokenZameen",
  tagline: "Real Estate, Curated.",
  description:
    "Discover exceptional homes, investment opportunities, land and communities — thoughtfully selected by TokenZameen.",
  locale: "en_IN",
  advisorPhone: process.env.NEXT_PUBLIC_ADVISOR_PHONE ?? "",
  advisorWhatsApp: process.env.NEXT_PUBLIC_ADVISOR_WHATSAPP ?? "",
  advisorEmail: process.env.NEXT_PUBLIC_ADVISOR_EMAIL ?? "",
} as const;

export const DISCLAIMERS = {
  financial:
    "All figures are indicative and subject to actual documentation, lease terms, taxes, expenses and transaction conditions. Nothing here is an offer, a guarantee of return, or investment advice.",
  intelligence:
    "Property Intelligence is TokenZameen's qualitative read on the factors that tend to drive an asset's performance. It is not a rating, a valuation or a guarantee of return.",
  calculator:
    "This calculator is a planning aid. Actual amounts depend on lender terms, charges, taxes and the final agreement.",
  sampleInventory:
    "Indicative layout shown to illustrate the interface. Unit numbers, sizes and availability are not an offer for sale and are confirmed only against the developer's released inventory.",
} as const;
