import type { Metadata } from "next";
import { ShortlistExperience } from "@/components/discovery/shortlist-experience";
import { getAllProjects } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

const DESCRIPTION =
  "The properties you have saved, kept in this browser, ready to compare or hand to a TokenZameen advisor.";

export const metadata: Metadata = {
  title: "My Shortlist",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/purchase/shortlist") },
  robots: { index: false, follow: true },
  openGraph: {
    title: "My Shortlist · TokenZameen",
    description: DESCRIPTION,
    url: absoluteUrl("/purchase/shortlist"),
    type: "website",
  },
};

export default function ShortlistPage() {
  return <ShortlistExperience projects={getAllProjects()} />;
}
