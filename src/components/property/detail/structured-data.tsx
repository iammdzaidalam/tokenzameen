import { CATEGORY_LABEL } from "@/lib/labels";
import { absoluteUrl } from "@/lib/seo";
import type { Availability, Project } from "@/types/catalog";

const SCHEMA_AVAILABILITY: Record<Availability, string> = {
  available: "https://schema.org/InStock",
  limited: "https://schema.org/LimitedAvailability",
  "coming-soon": "https://schema.org/PreOrder",
  "sold-out": "https://schema.org/SoldOut",
};

export function StructuredData({ project }: { project: Project }) {
  const url = absoluteUrl(`/purchase/${project.slug}`);

  const address: Record<string, unknown> = { "@type": "PostalAddress", addressCountry: "IN" };
  const locality = project.location.region ?? project.location.cities[0];
  if (locality) address.addressLocality = locality;
  if (project.location.state) address.addressRegion = project.location.state;

  const entity: Record<string, unknown> = {
    "@type": project.primaryCategory === "commercial" ? ["Product", "Place"] : ["Product", "Residence"],
    name: project.name,
    description: project.summary,
    url,
    image: [absoluteUrl(project.hero.src), ...project.gallery.map((asset) => absoluteUrl(asset.src))],
    category: CATEGORY_LABEL[project.primaryCategory],
    address,
  };

  if (project.developer) {
    entity.brand = { "@type": "Organization", name: project.developer.name };
  }

  if (project.priceFrom) {
    entity.offers = {
      "@type": "Offer",
      url,
      price: project.priceFrom.amount,
      priceCurrency: project.priceFrom.currency,
      availability: SCHEMA_AVAILABILITY[project.availability],
    };
  }

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Purchase", item: absoluteUrl("/purchase") },
      {
        "@type": "ListItem",
        position: 2,
        name: CATEGORY_LABEL[project.primaryCategory],
        item: absoluteUrl(`/purchase/${project.primaryCategory}`),
      },
      { "@type": "ListItem", position: 3, name: project.name, item: url },
    ],
  };

  const graph: Array<Record<string, unknown>> = [entity, breadcrumb];

  if (project.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: project.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
    /</g,
    "\\u003c",
  );

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
