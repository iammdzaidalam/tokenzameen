import type { Metadata } from "next";
import { LegalArticle, type LegalSection } from "../_components/legal-article";
import { absoluteUrl } from "@/lib/seo";

const SUMMARY =
  "What the forms on this site collect, why, who can see it, how long we keep it, and the choices you have.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: SUMMARY,
  alternates: { canonical: absoluteUrl("/legal/privacy") },
  openGraph: { title: "Privacy Policy · TokenZameen", description: SUMMARY, url: absoluteUrl("/legal/privacy"), type: "website" },
};

const SECTIONS: LegalSection[] = [
  {
    id: "what-we-collect",
    heading: "What we collect",
    blocks: [
      "Only what a form asks for, and only when you send it. Depending on the form, that is:",
      {
        list: [
          "Your name and mobile number — required on every enquiry, callback, document request and site-visit form.",
          "Your email address — optional on most forms, required when you ask for a document because that is how it is sent.",
          "What you are looking for — the property you are enquiring about, a budget band, a purpose, a location, a timeline, a preferred callback window, and anything you type into the message box.",
          "For a site visit — the date, the time slot and the number of visitors.",
          "Your consent to be contacted, which every form requires before it can be sent.",
          "The campaign that brought you to the site, if any (the UTM parameters on the first link you arrived through).",
          "A one-way hash of your IP address and your browser's user-agent string. We never store the IP address itself.",
        ],
      },
      "If you subscribe to collection updates in the footer, we store the email address you enter and your consent. That is not an enquiry and is never joined to one.",
    ],
  },
  {
    id: "usage-data",
    heading: "How the site is used",
    blocks: [
      "We record product events — a page view, a property view, a search, a filter, a save, a comparison, a brochure download, an enquiry, a call or WhatsApp click, a site-visit request — so we can see what the collection is used for and what is not working.",
      "Each event carries the page or property involved and a session identifier that is hashed together with your hashed IP before it is stored. It does not carry your name or contact details.",
      "Your shortlist, your comparison and your recently viewed properties live in your own browser's storage. They are never sent to us.",
    ],
  },
  {
    id: "why",
    heading: "Why we collect it",
    blocks: [
      {
        list: [
          "To answer your enquiry, call you back in the window you chose, send the document you asked for, and confirm a site visit.",
          "To assign your enquiry to an advisor and let that advisor pick it up again from your reference code.",
          "To prioritise. Enquiries are scored on what you have done — viewed, saved, requested a document, asked for a site visit — so an advisor sees the people closest to a decision first. The rules are fixed and simple, not a black box, and you can ask what your enquiry's stage is.",
          "To understand which properties, filters and pages are used, so the collection and the site improve.",
          "To send collection updates, only if you subscribed to them.",
        ],
      },
    ],
  },
  {
    id: "who-sees-it",
    heading: "Who can see it",
    blocks: [
      {
        list: [
          "TokenZameen property advisors, who handle your enquiry.",
          "The developer or seller of the property you enquired about, where your enquiry concerns a specific property, so that they can respond to it. We do not pass your details to developers of properties you did not ask about.",
          "The providers that host the site, the database and the message channels we use to reach you. They process the data for us and not for themselves.",
        ],
      },
      "We do not sell your details and we do not share them with advertisers.",
    ],
  },
  {
    id: "tokenzameen-ai",
    heading: "TokenZameen AI",
    blocks: [
      "When you ask TokenZameen AI a question, the question is sent to our server, which works out which published properties it concerns. If a language model is configured for the site, the question and the published details of those properties are then sent to the model provider to write the reply in plain language. Your name, contact details and enquiry history are not sent with it.",
      "If no model is configured, the reply is composed on our server from the same published details, and nothing leaves the site.",
    ],
  },
  {
    id: "retention-and-choices",
    heading: "How long we keep it, and your choices",
    blocks: [
      "We keep an enquiry while it is open and for a period afterwards so an advisor can pick it up again and so we have a record of what was said. Usage events are kept in aggregate for as long as they are useful for understanding the site.",
      {
        list: [
          "Ask us what we hold about you, ask us to correct it, or ask us to delete it. We will do so unless we need to keep a record of a completed transaction.",
          "Withdraw your consent to be contacted at any time by telling the advisor, or through the contact page.",
          "Unsubscribe from collection updates using the link in any update, or by asking.",
          "Clear your browser's site data to remove your shortlist, comparison and recently viewed properties.",
        ],
      },
      "The site is not intended for anyone under 18.",
    ],
  },
  {
    id: "security-and-changes",
    heading: "Security, and changes",
    blocks: [
      "We collect the minimum a form needs, hash IP addresses before storing them, and restrict who inside TokenZameen can see enquiries. No method of storage or transmission is perfectly secure, and we do not claim ours is.",
      "This policy may change. The date at the top of the page is the date of the current version.",
    ],
  },
];

export default function PrivacyPage() {
  return <LegalArticle slug="privacy" title="Privacy Policy" summary={SUMMARY} sections={SECTIONS} />;
}
