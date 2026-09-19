import type { Metadata } from "next";
import { CompareExperience } from "@/components/discovery/compare-experience";
import { getAllProjects } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

const DESCRIPTION =
  "Put up to four TokenZameen properties side by side — price, area, location, availability, documentation and what is still on request.";

export const metadata: Metadata = {
  title: "Compare Properties",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/purchase/compare") },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Compare Properties · TokenZameen",
    description: DESCRIPTION,
    url: absoluteUrl("/purchase/compare"),
    type: "website",
  },
};

export default function ComparePage() {
  return <CompareExperience projects={getAllProjects()} />;
}
