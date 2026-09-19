import type { Metadata } from "next";
import { AdvisoryCta } from "@/components/category/advisory-cta";
import { CategoryTiles } from "@/components/home/category-tiles";
import { CollectionRail } from "@/components/home/collection-rail";
import { CollectionWall } from "@/components/home/collection-wall";
import { EditorialIntro } from "@/components/home/editorial-intro";
import { HomeHero } from "@/components/home/home-hero";
import { HomeStats } from "@/components/home/home-stats";
import { Locations } from "@/components/home/locations";
import { StatementsBand } from "@/components/home/statements-band";
import { SITE } from "@/content/config";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: absoluteUrl("/"),
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <EditorialIntro />
      <HomeStats />
      <CategoryTiles />
      <Locations />
      <CollectionRail />
      <CollectionWall />
      <StatementsBand />
      <AdvisoryCta />
    </>
  );
}
