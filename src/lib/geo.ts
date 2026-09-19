/**
 * City-level centroids for the markets the collection covers. These are public
 * geographic reference points, not project sites — no project has a surveyed
 * coordinate on file, and the brief forbids inventing one. Every consumer labels
 * the pin with the city, never with a street or a plot.
 */
export interface CityPoint {
  key: string;
  label: string;
  region: string;
  lng: number;
  lat: number;
}

export const CITY_POINTS: CityPoint[] = [
  { key: "goa", label: "Goa", region: "Goa", lng: 73.83, lat: 15.49 },
  { key: "goa-maharashtra-border", label: "Goa–Maharashtra border", region: "Konkan corridor", lng: 73.85, lat: 15.72 },
  { key: "delhi", label: "Delhi", region: "Chandni Chowk", lng: 77.23, lat: 28.65 },
  { key: "gurgaon", label: "Gurgaon", region: "NCR", lng: 77.03, lat: 28.46 },
  { key: "haridwar", label: "Haridwar", region: "Uttarakhand", lng: 78.16, lat: 29.95 },
  { key: "bangalore", label: "Bangalore", region: "Karnataka", lng: 77.59, lat: 12.97 },
];

export function cityPointsFor(cities: string[], region: string | null): CityPoint[] {
  const wanted = new Set(cities.map((c) => c.toLowerCase()));
  const points = CITY_POINTS.filter((p) => wanted.has(p.label.toLowerCase()));
  if (region && region.toLowerCase().includes("goa–maharashtra")) {
    const border = CITY_POINTS.find((p) => p.key === "goa-maharashtra-border");
    if (border) return [border];
  }
  return points;
}
