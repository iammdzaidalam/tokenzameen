import type { Metadata } from "next";
import { LegalArticle, type LegalSection } from "../_components/legal-article";
import { DISCLAIMERS } from "@/content/config";
import { absoluteUrl } from "@/lib/seo";

const SUMMARY =
  "The plain-language version of every caveat on the site: where the information comes from, what “on request” means, and what nothing here is.";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: SUMMARY,
  alternates: { canonical: absoluteUrl("/legal/disclaimer") },
  openGraph: { title: "Disclaimer · TokenZameen", description: SUMMARY, url: absoluteUrl("/legal/disclaimer"), type: "website" },
};

const SECTIONS: LegalSection[] = [
  {
    id: "source",
    heading: "Where the information comes from",
    blocks: [
      "Every fact about a project — its description, price, areas, configurations, amenities, connectivity, documents, inventory, developer and possession — is supplied by the developer or project owner. TokenZameen organises and presents it. It can change, and it can be withdrawn, without notice to us or to you.",
      "Where a project page lists “information being compiled”, those are fields the project owner has not yet supplied. Where a field reads “on request”, we do not have it. Neither is an estimate.",
    ],
  },
  {
    id: "not-an-offer",
    heading: "Nothing here is an offer",
    blocks: [
      "Nothing on this site is an offer, an invitation to purchase or invest, a prospectus, or a promise that a unit, plot or price is available. Availability and price are confirmed only by the developer, against their released inventory, at the time of booking.",
      "Any purchase is a transaction between you and the developer or seller, on their terms and paperwork. TokenZameen introduces, informs and assists; it is not a party to the sale.",
    ],
  },
  {
    id: "not-advice",
    heading: "Not investment, legal or tax advice",
    blocks: [
      DISCLAIMERS.financial,
      DISCLAIMERS.calculator,
      DISCLAIMERS.intelligence,
      "Rental income, yield, appreciation and any return described anywhere on the site are indicative and are never guaranteed. Past performance of a location or an asset class says nothing certain about the future. Take your own legal, financial and tax advice before committing to anything.",
    ],
  },
  {
    id: "verification",
    heading: "Verification and RERA",
    blocks: [
      "The “TokenZameen Verified” mark on a project means our team has read the original document behind at least three of six facets — project, developer, location, documentation, pricing and inventory. The unchecked facets are shown as unchecked on the project page and on the Verified page. The mark is not a valuation, not legal advice, and not a guarantee that a project will be delivered on time or at all.",
      "RERA registration details are shown only where a registration is on file with us. Where none is shown, none has been supplied. Ask the developer for the RERA number and the approvals before paying any amount, including a booking amount.",
    ],
  },
  {
    id: "indicative-inventory-and-artwork",
    heading: "Indicative inventory and artwork",
    blocks: [
      DISCLAIMERS.sampleInventory,
      "Artwork shown for projects and collections is illustrative and generated, not photography of the project, until project photography is supplied. It shows nothing about a project's design, materials, surroundings or state of construction.",
      "Distances and travel times appear only where they have been supplied by the project owner. Where they do appear, they are indicative and depend on the time of day and the route.",
    ],
  },
  {
    id: "tokenzameen-ai",
    heading: "TokenZameen AI",
    blocks: [
      "TokenZameen AI reads your question and answers only from what each project has published on this site. It can misread a question, it can miss something, and it does not know anything a project page does not. It is a way to find things to look at, not a recommendation and not advice. Check what it says against the project page and with an advisor.",
    ],
  },
  {
    id: "responsibility",
    heading: "Your responsibility, and ours",
    blocks: [
      "Do your own diligence. Read the title, the approvals and the agreement, and have your own lawyer read them too. Visit the site. Ask for the complete cost sheet, not the starting price, and for the availability sheet dated the day you decide.",
      "We will tell you what we know, tell you what we do not, and never present a number we cannot source. That is the whole of what this site promises.",
    ],
  },
];

export default function DisclaimerPage() {
  return <LegalArticle slug="disclaimer" title="Disclaimer" summary={SUMMARY} sections={SECTIONS} />;
}
