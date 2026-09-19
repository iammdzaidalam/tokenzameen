import type { MetadataRoute } from "next";
import { categories, getAllProjects, intents } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/purchase"), lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: absoluteUrl("/purchase/properties"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/discover"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/verified"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/advisory"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/purchase/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((project) => ({
    url: absoluteUrl(`/purchase/${project.slug}`),
    lastModified: new Date(project.lastUpdated),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const intentRoutes: MetadataRoute.Sitemap = intents.map((intent) => ({
    url: absoluteUrl(`/discover/${intent.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...projectRoutes, ...intentRoutes];
}
