import { AmenitiesSection } from "@/components/property/detail/amenities-section";
import { CalculatorSection } from "@/components/property/detail/calculator-section";
import { DetailHero } from "@/components/property/detail/detail-hero";
import { DetailRail } from "@/components/property/detail/detail-rail";
import { DeveloperSection } from "@/components/property/detail/developer-section";
import { DocumentsSection } from "@/components/property/detail/documents-section";
import { FaqSection } from "@/components/property/detail/faq-section";
import { GallerySection } from "@/components/property/detail/gallery-section";
import { HighlightsSection } from "@/components/property/detail/highlights-section";
import { InventorySection } from "@/components/property/detail/inventory-section";
import { InvestmentSection } from "@/components/property/detail/investment-section";
import { LocationSection } from "@/components/property/detail/location-section";
import { MobileActionBar } from "@/components/property/detail/mobile-action-bar";
import { OverviewSection } from "@/components/property/detail/overview-section";
import { PendingInformationSection } from "@/components/property/detail/pending-information";
import { RelatedSection } from "@/components/property/detail/related-section";
import { DetailRequestProvider } from "@/components/property/detail/request-context";
import { sectionIndexer, showsEmiCalculator, showsRoiCalculator } from "@/components/property/detail/sections";
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
  /** Replaces the default `EnquiryForm` / `SiteVisitForm` in the closing band. */
  enquiryForm?: React.ReactNode;
  siteVisitForm?: React.ReactNode;
}) {
  const next = sectionIndexer();
  const hasCalculator = showsEmiCalculator(project) || showsRoiCalculator(project);

  return (
    <DetailRequestProvider projectSlug={project.slug} projectName={project.name}>
      <StructuredData project={project} />
      <ViewRecorder slug={project.slug} />

      <DetailHero project={project} />
      <DetailRail project={project} />

      <OverviewSection project={project} index={next()} />
      <HighlightsSection project={project} index={next()} />
      <GallerySection name={project.name} gallery={project.gallery} index={next()} />
      <LocationSection project={project} index={next()} />
      <AmenitiesSection project={project} index={next()} />
      <InventorySection project={project} index={next()} />
      <InvestmentSection project={project} index={next()} />
      {hasCalculator ? <CalculatorSection project={project} index={next()} /> : null}
      <DocumentsSection project={project} index={next()} />
      <PendingInformationSection project={project} index={next()} />
      <DeveloperSection project={project} index={next()} />
      <FaqSection project={project} index={next()} />
      <SiteVisitSection
        project={project}
        index={next()}
        siteVisitForm={siteVisitForm}
        enquiryForm={enquiryForm}
      />
      <RelatedSection project={project} index={next()} />

      <MobileActionBar project={project} />
    </DetailRequestProvider>
  );
}
