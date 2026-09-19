import type { Metadata } from "next";
import { AdvisoryBand } from "@/components/discovery/advisory-band";
import { DiscoveryExperience } from "@/components/discovery/discovery-experience";
import { filtersFromSearchParams } from "@/components/discovery/search-params";
import { getAllCities, getAllProjects } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

const DESCRIPTION =
  "Filter the TokenZameen collection by location, budget, property type, purpose and availability — or describe what you want in plain language.";

export const metadata: Metadata = {
  title: "Explore Properties",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/purchase/properties") },
  openGraph: {
    title: "Explore Properties · TokenZameen",
    description: DESCRIPTION,
    url: absoluteUrl("/purchase/properties"),
    type: "website",
  },
};

export default async function PropertiesPage({
  searchParams,
}: PageProps<"/purchase/properties">) {
  const params = await searchParams;

  return (
    <>
      <DiscoveryExperience
        projects={getAllProjects()}
        cities={getAllCities()}
        initialFilters={filtersFromSearchParams(params)}
      />
      <AdvisoryBand heading="Narrow it to three, then talk to us." />
    </>
  );
}
