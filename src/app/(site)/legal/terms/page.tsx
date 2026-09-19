import type { Metadata } from "next";
import { LegalArticle, type LegalSection } from "../_components/legal-article";
import { absoluteUrl } from "@/lib/seo";

const SUMMARY =
  "What this site is for, what the property information on it is and is not, and what you agree to when you send us an enquiry.";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: SUMMARY,
  alternates: { canonical: absoluteUrl("/legal/terms") },
  openGraph: { title: "Terms of Use · TokenZameen", description: SUMMARY, url: absoluteUrl("/legal/terms"), type: "website" },
};

const SECTIONS: LegalSection[] = [
  {
    id: "what-this-site-is",
    heading: "What this site is",
    blocks: [
      "TokenZameen presents a curated collection of real-estate opportunities and connects you with a TokenZameen property advisor. It helps you discover, compare and enquire. It does not sell property itself.",
      "Any purchase you go on to make is a transaction between you and the project's developer or seller, on their terms, their paperwork and their price. TokenZameen's role is to introduce, inform and assist.",
      "By using the site you accept these terms. If you do not, please do not use it.",
    ],
  },
  {
    id: "property-information",
    heading: "Property information",
    blocks: [
      "Information about each project — its description, pricing, areas, configurations, amenities, documents, inventory and location — is supplied by the developer or project owner. We organise it; we do not originate it. It can change without notice.",
      "Where a value reads “on request” or “price on request”, it means we do not have it on file. It is not an estimate and should not be read as one.",
      "Some project pages show an indicative layout to demonstrate how unit or plot selection works. Those rows are labelled as indicative on the page. They are not an offer for sale and are confirmed only against the developer's released inventory.",
      "RERA registration details are shown only where a registration is on file with us. Where none is shown, none has been supplied to us; ask for it before any money changes hands, including a booking amount.",
      "The “TokenZameen Verified” mark means our team has read the underlying document for that facet. It is not a valuation, legal advice or a guarantee of delivery. The unchecked facets of every project are shown as unchecked.",
    ],
  },
  {
    id: "figures-and-tools",
    heading: "Figures, calculators and TokenZameen AI",
    blocks: [
      "Every figure on the site is indicative. Yields, returns, EMIs and investment summaries depend on final documentation, lease terms, taxes, charges, expenses and the conditions of the actual transaction. Nothing on the site is an offer, an invitation to invest, a guarantee of return, or investment, legal or tax advice.",
      "The EMI and ROI calculators are planning aids. Their outputs are examples built from the numbers you enter, not quotations.",
      "TokenZameen AI answers only from information published on this site. It can misread a question and it does not know anything a project page does not. Treat its answers as a starting point for a conversation with an advisor, not as advice.",
    ],
  },
  {
    id: "enquiries",
    heading: "Enquiries and site visits",
    blocks: [
      "When you send an enquiry, request a callback, request a document or book a site visit, you are asking a TokenZameen advisor to contact you. Each form asks for your consent to that before it can be sent.",
      "A site-visit request is a request. It becomes an appointment only when an advisor confirms it with you.",
      "You agree to give accurate details and to send enquiries only on your own behalf or with the permission of the person you are enquiring for. We may decline or close an enquiry that appears automated or misleading.",
      "Where an enquiry concerns a specific property, we may share it with that property's developer or seller so they can respond. The privacy policy explains this in more detail.",
    ],
  },
  {
    id: "using-the-site",
    heading: "Using the site",
    blocks: [
      {
        list: [
          "Use the site for your own property search, or for someone you are genuinely helping.",
          "Do not scrape, copy or republish the collection, its text or its artwork, or use the site to build a competing listing.",
          "Do not attempt to interfere with the site, its forms or its rate limits, or to submit content that is unlawful or misleading.",
          "Shortlists, comparisons and recently viewed properties are stored in your own browser. Clearing your browser data removes them.",
        ],
      },
      "The text, design and artwork on the site belong to TokenZameen or are used with the permission of the project owner. Artwork shown for projects is illustrative until project photography is supplied, and is labelled as such where it appears.",
    ],
  },
  {
    id: "liability-and-changes",
    heading: "Our responsibility, and changes",
    blocks: [
      "We work to keep the site accurate and say plainly where information is missing. We cannot promise the site is error-free or always available, and we are not responsible for decisions taken on the basis of indicative figures, on information a project owner later changes, or on anything the site marks as being on request.",
      "Links to developer or third-party websites lead to sites we do not control.",
      "These terms may change. The date at the top of the page is the date of the current version, and continued use after a change means you accept it.",
    ],
  },
];

export default function TermsPage() {
  return <LegalArticle slug="terms" title="Terms of Use" summary={SUMMARY} sections={SECTIONS} />;
}
