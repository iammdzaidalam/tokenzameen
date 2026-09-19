import { AmenitiesSection } from "@/components/property/detail/amenities-section";
import { CalculatorSection } from "@/components/property/detail/calculator-section";
import { DetailHero } from "@/components/property/detail/detail-hero";
import { DetailRail } from "@/components/property/detail/detail-rail";
import { DeveloperSection } from "@/components/property/detail/developer-section";
import { DocumentsSection } from "@/components/property/detail/documents-section";
import { FaqSection } from "@/components/property/detail/faq-section";
import { GallerySection } from "@/components/property/detail/gallery-section";
import { HighlightsSection } from "@/components/property/detail/highlights-section";
import { IntelligenceSection } from "@/components/property/detail/intelligence-section";
import { InventorySection } from "@/components/property/detail/inventory-section";
import { InvestmentSection } from "@/components/property/detail/investment-section";
import { LocationSection } from "@/components/property/detail/location-section";
import { MobileActionBar } from "@/components/property/detail/mobile-action-bar";
import { OverviewSection } from "@/components/property/detail/overview-section";
import { PendingInformationSection } from "@/components/property/detail/pending-information";
import { RelatedSection } from "@/components/property/detail/related-section";
import { DetailRequestProvider } from "@/components/property/detail/request-context";
import { SiteVisitSection } from "@/components/property/detail/site-visit-section";
import { StructuredData } from "@/components/property/detail/structured-data";
import { ViewRecorder } from "@/components/property/detail/view-recorder";
import type { Project } from "@/types/catalog";

export function ProjectDetail({
  project,
  enquiryForm,
  siteVisitForm,
}: {
  project: Project;
  /** Mount the lead form here once @/components/forms exists. */
  enquiryForm?: React.ReactNode;
  siteVisitForm?: React.ReactNode;
}) {
  return (
    <DetailRequestProvider projectSlug={project.slug} projectName={project.name}>
      <StructuredData project={project} />
      <ViewRecorder slug={project.slug} />

      <DetailHero project={project} />
      <DetailRail project={project} />

      <OverviewSection project={project} />
      <HighlightsSection project={project} />
      <GallerySection name={project.name} gallery={project.gallery} />
      <LocationSection project={project} />
      <AmenitiesSection project={project} />
      <InventorySection project={project} />
      <IntelligenceSection project={project} />
      <CalculatorSection project={project} />
      <InvestmentSection project={project} />
      <DocumentsSection project={project} />
      <PendingInformationSection project={project} />
      <DeveloperSection project={project} />
      <FaqSection project={project} />
      <SiteVisitSection
        project={project}
        siteVisitForm={siteVisitForm}
        enquiryForm={enquiryForm}
      />
      <RelatedSection project={project} />

      <MobileActionBar project={project} />
    </DetailRequestProvider>
  );
}
