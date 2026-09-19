export type CategorySlug =
  | "apartments"
  | "villas"
  | "commercial"
  | "sustainable-living"
  | "spiritual-residences"
  | "plots";

export type PropertyType =
  | "apartment"
  | "villa"
  | "commercial"
  | "sustainable-villa"
  | "spiritual-residence"
  | "plot";

export type IntentSlug =
  | "buy-a-home"
  | "second-home"
  | "rental-income"
  | "buy-commercial"
  | "own-land"
  | "live-differently";

export type Purpose =
  | "self-use"
  | "investment"
  | "second-home"
  | "rental-income"
  | "capital-appreciation"
  | "commercial-income"
  | "land-banking";

export type Availability = "available" | "limited" | "coming-soon" | "sold-out";

export type UnitStatus = "available" | "reserved" | "sold";

export type AreaUnit = "sqft" | "sqyd" | "acre";

export type SpecialTag =
  | "pre-leased"
  | "high-rental-potential"
  | "early-access"
  | "premium-location"
  | "sustainable"
  | "investment-opportunity";

export type BedroomConfig = "1bhk" | "2bhk" | "3bhk" | "4bhk" | "5plus";

export interface Area {
  min: number;
  max: number | null;
  unit: AreaUnit;
}

export interface Money {
  amount: number;
  currency: "INR";
}

export interface LocationInfo {
  label: string;
  cities: string[];
  region: string | null;
  state: string | null;
  /** Only set when a surveyed coordinate has been supplied by the project owner. */
  coordinates: { lat: number; lng: number } | null;
}

export interface ConnectivityPoint {
  label: string;
  minutes: number | null;
  distanceKm: number | null;
  kind: "metro" | "airport" | "hospital" | "school" | "market" | "highway" | "landmark";
}

export interface Highlight {
  label: string;
  value: string;
  icon: HighlightIcon;
}

export type HighlightIcon =
  | "type"
  | "location"
  | "area"
  | "status"
  | "possession"
  | "price"
  | "bedrooms"
  | "floor"
  | "facing"
  | "yield"
  | "lease"
  | "ownership";

/**
 * Scored 0-10. Only ever populated from an assessment recorded by the TokenZameen
 * team; never derived in code. A null block renders the "awaiting assessment"
 * state instead of fabricated bars.
 */
export interface PropertyIntelligence {
  locationAdvantage: number;
  demand: number;
  rentalPotential: number;
  infrastructure: number;
  liquidity: number;
  capitalAppreciation: number;
  horizon: string;
  assessedOn: string;
  summary: string;
}

export interface CommercialTerms {
  propertyValue: Money | null;
  initialInvestment: Money | null;
  monthlyRent: Money | null;
  annualRent: Money | null;
  grossYieldPercent: number | null;
  leaseTenure: string | null;
  ownership: string | null;
  paymentStructure: string | null;
  preLeased: boolean;
  tenant: string | null;
}

interface UnitBase {
  id: string;
  status: UnitStatus;
  price: Money | null;
  /** Indicative layout data used to demonstrate the interface before the
   *  developer releases a live availability sheet. Always surfaced to the user. */
  sample: boolean;
}

export interface ApartmentUnit extends UnitBase {
  kind: "apartment";
  tower: string | null;
  floor: number | null;
  unitNumber: string;
  bedrooms: BedroomConfig | null;
  area: Area | null;
}

export interface VillaUnit extends UnitBase {
  kind: "villa";
  villaNumber: string;
  plotArea: Area | null;
  builtUpArea: Area | null;
  bedrooms: BedroomConfig | null;
}

export interface CommercialUnit extends UnitBase {
  kind: "commercial";
  unitNumber: string;
  floor: number | null;
  area: Area | null;
  monthlyRent: Money | null;
  leaseStatus: string | null;
  tenant: string | null;
}

export interface PlotUnit extends UnitBase {
  kind: "plot";
  plotNumber: string;
  area: Area | null;
  facing: string | null;
  roadWidthFt: number | null;
  /** Percentage coordinates inside the masterplan viewport, when a plan is available. */
  plan: { x: number; y: number; w: number; h: number } | null;
}

export type InventoryUnit = ApartmentUnit | VillaUnit | CommercialUnit | PlotUnit;

export type DocumentKind =
  | "brochure"
  | "floor-plan"
  | "price-list"
  | "payment-plan"
  | "site-plan"
  | "rera"
  | "approval"
  | "legal"
  | "lease"
  | "specification";

export interface DocumentRef {
  id: string;
  title: string;
  kind: DocumentKind;
  /** Null until the file is uploaded; the UI then offers a request-access flow. */
  href: string | null;
  gated: boolean;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface MediaAsset {
  src: string;
  alt: string;
  /** True while a generated stand-in is used instead of project photography. */
  placeholder: boolean;
  caption: string | null;
}

export interface Developer {
  name: string;
  about: string | null;
  established: string | null;
}

export interface VerifiedFacets {
  project: boolean;
  developer: boolean;
  location: boolean;
  documentation: boolean;
  pricing: boolean;
  inventory: boolean;
}

export interface Project {
  slug: string;
  name: string;
  positioning: string;
  summary: string;
  categories: CategorySlug[];
  primaryCategory: CategorySlug;
  propertyTypes: PropertyType[];
  intents: IntentSlug[];
  purposes: Purpose[];
  location: LocationInfo;
  priceFrom: Money | null;
  priceNote: string | null;
  area: Area | null;
  bedrooms: BedroomConfig[];
  availability: Availability;
  specialTags: SpecialTag[];
  usps: string[];
  overview: string[];
  whyThisProject: string[];
  highlights: Highlight[];
  amenities: string[];
  connectivity: ConnectivityPoint[];
  intelligence: PropertyIntelligence | null;
  commercial: CommercialTerms | null;
  inventory: InventoryUnit[];
  masterplan: MediaAsset | null;
  documents: DocumentRef[];
  faqs: Faq[];
  /** Fields the PRD asks the project page to show that the project owner has not
   *  supplied yet. Rendered as an explicit "information being compiled" block. */
  pendingInformation: string[];
  developer: Developer | null;
  reraNumber: string | null;
  possession: string | null;
  hero: MediaAsset;
  gallery: MediaAsset[];
  verified: VerifiedFacets;
  lastUpdated: string;
  featured: boolean;
  /** Ordering weight for the "Recommended" sort. Higher surfaces first. */
  editorialRank: number;
}

export interface Category {
  slug: CategorySlug;
  index: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  heroHeadline: string;
  heroSubline: string;
  audience: string[];
  cta: string;
  accent: "gold" | "sage" | "lotus" | "steel";
  hero: MediaAsset;
}

export interface Intent {
  slug: IntentSlug;
  title: string;
  description: string;
  categories: CategorySlug[];
  purposes: Purpose[];
}
