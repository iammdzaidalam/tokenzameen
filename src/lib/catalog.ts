import { categories, categoryBySlug } from "@/content/categories";
import { intents, intentBySlug } from "@/content/intents";
import { projects, projectBySlug } from "@/content/projects";
import type { CategorySlug, IntentSlug, Project } from "@/types/catalog";

export { categories, intents };

export function getAllProjects(): Project[] {
  return projects;
}

export function getProject(slug: string): Project | null {
  return projectBySlug.get(slug) ?? null;
}

export function getCategory(slug: string) {
  return categoryBySlug.get(slug as CategorySlug) ?? null;
}

export function getIntent(slug: string) {
  return intentBySlug.get(slug as IntentSlug) ?? null;
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return categoryBySlug.has(slug as CategorySlug);
}

export function getProjectsInCategory(slug: CategorySlug): Project[] {
  return projects
    .filter((p) => p.categories.includes(slug))
    .sort((a, b) => b.editorialRank - a.editorialRank);
}

export function getProjectsForIntent(slug: IntentSlug): Project[] {
  return projects
    .filter((p) => p.intents.includes(slug))
    .sort((a, b) => b.editorialRank - a.editorialRank);
}

export function getFeaturedProjects(): Project[] {
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => b.editorialRank - a.editorialRank);
}

export function getRelatedProjects(project: Project, limit = 3): Project[] {
  const scored = projects
    .filter((p) => p.slug !== project.slug)
    .map((p) => {
      const sharedCategories = p.categories.filter((c) => project.categories.includes(c)).length;
      const sharedCities = p.location.cities.filter((c) => project.location.cities.includes(c)).length;
      return { project: p, score: sharedCategories * 3 + sharedCities * 2 + p.editorialRank / 1000 };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.project);
}

export function getAllCities(): string[] {
  const set = new Set<string>();
  for (const project of projects) {
    for (const city of project.location.cities) set.add(city);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getCategoryCounts(): Record<CategorySlug, number> {
  const counts = Object.fromEntries(categories.map((c) => [c.slug, 0])) as Record<CategorySlug, number>;
  for (const project of projects) {
    for (const category of project.categories) counts[category] += 1;
  }
  return counts;
}

export function getPublishedPriceBounds(): { min: number; max: number } {
  const amounts = projects
    .map((p) => p.priceFrom?.amount)
    .filter((a): a is number => typeof a === "number");
  if (amounts.length === 0) return { min: 2_500_000, max: 100_000_000 };
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
}

/** Budget slider bounds come from the brief (₹25 lakh to ₹10 crore+), not from inventory. */
export const BUDGET_FLOOR = 2_500_000;
export const BUDGET_CEILING = 100_000_000;
