import type {
  Availability,
  CategorySlug,
  DocumentKind,
  Purpose,
  PropertyType,
  SpecialTag,
  UnitStatus,
} from "@/types/catalog";

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  apartment: "Apartment",
  villa: "Villa",
  commercial: "Commercial",
  "sustainable-villa": "Sustainable Villa",
  "spiritual-residence": "Spiritual Residence",
  plot: "Plot",
};

export const CATEGORY_LABEL: Record<CategorySlug, string> = {
  apartments: "Apartments",
  villas: "Villas",
  commercial: "Commercial Spaces",
  "sustainable-living": "Sustainable Living",
  "spiritual-residences": "Spiritual Residences",
  plots: "Plots",
};

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: "Available",
  limited: "Limited Inventory",
  "coming-soon": "Coming Soon",
  "sold-out": "Sold Out",
};

export const PURPOSE_LABEL: Record<Purpose, string> = {
  "self-use": "Self Use",
  investment: "Investment",
  "second-home": "Second Home",
  "rental-income": "Rental Income",
  "capital-appreciation": "Capital Appreciation",
  "commercial-income": "Commercial Income",
  "land-banking": "Land Banking",
};

export const SPECIAL_TAG_LABEL: Record<SpecialTag, string> = {
  "pre-leased": "Pre-Leased",
  "high-rental-potential": "High Rental Potential",
  "early-access": "Early Access",
  "premium-location": "Premium Location",
  sustainable: "Sustainable",
  "investment-opportunity": "Investment Opportunity",
};

export const UNIT_STATUS_LABEL: Record<UnitStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  brochure: "Brochure",
  "floor-plan": "Floor plan",
  "price-list": "Price list",
  "payment-plan": "Payment plan",
  "site-plan": "Site plan",
  rera: "RERA",
  approval: "Approval",
  legal: "Legal",
  lease: "Lease",
  specification: "Specification",
};
