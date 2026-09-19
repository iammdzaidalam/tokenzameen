import type { Metadata } from "next";
import { AdvisoryJourney } from "@/components/purchase/advisory-journey";
import { AiTeaser } from "@/components/purchase/ai-teaser";
import { CategoryCollections } from "@/components/purchase/category-collections";
import { CompareTeaser } from "@/components/purchase/compare-teaser";
import { EditorialIntro } from "@/components/purchase/editorial-intro";
import { FeaturedOpportunities } from "@/components/purchase/featured-opportunities";
import { IntentIndex } from "@/components/purchase/intent-index";
import { PurchaseHero } from "@/components/purchase/purchase-hero";
import { TokenZameenCollection } from "@/components/purchase/tokenzameen-collection";
import { VerifiedSection } from "@/components/purchase/verified-section";
import { SITE } from "@/content/config";
import { getAllCities, getAllProjects, getFeaturedProjects } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Purchase — Real Estate, Curated.",
  description: SITE.description,
  alternates: { canonical: absoluteUrl("/purchase") },
  openGraph: {
    title: "Purchase · TokenZameen",
    description: SITE.description,
    url: absoluteUrl("/purchase"),
    type: "website",
  },
};

export default function PurchasePage() {
  const allProjects = getAllProjects();
  const featured = getFeaturedProjects();
  const featuredSlugs = new Set(featured.map((project) => project.slug));
  const remaining = allProjects.filter((project) => !featuredSlugs.has(project.slug));

  return (
    <>
      <PurchaseHero cities={getAllCities()} />
      <EditorialIntro />
      <CategoryCollections />
      <TokenZameenCollection projects={featured} />
      <VerifiedSection />
      <FeaturedOpportunities projects={remaining} total={allProjects.length} />
      <IntentIndex />
      <AiTeaser />
      <CompareTeaser />
      <AdvisoryJourney />
    </>
  );
}
