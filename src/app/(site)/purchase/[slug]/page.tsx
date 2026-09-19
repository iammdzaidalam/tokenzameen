import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryExperience } from "@/components/category/category-experience";
import { ProjectDetail } from "@/components/property/detail/project-detail";
import { categories, getAllProjects, getCategory, getProject, getProjectsInCategory } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...categories.map((category) => ({ slug: category.slug })),
    ...getAllProjects().map((project) => ({ slug: project.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps<"/purchase/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (category) {
    return {
      title: `${category.name} — ${category.tagline}`,
      description: category.heroSubline,
      alternates: { canonical: absoluteUrl(`/purchase/${category.slug}`) },
      openGraph: {
        title: `${category.name} · TokenZameen`,
        description: category.heroSubline,
        url: absoluteUrl(`/purchase/${category.slug}`),
      },
    };
  }

  const project = getProject(slug);
  if (!project) return { title: "Not found" };

  return {
    title: `${project.name} — ${project.location.label}`,
    description: project.summary,
    alternates: { canonical: absoluteUrl(`/purchase/${project.slug}`) },
    openGraph: {
      title: `${project.name} · TokenZameen`,
      description: project.summary,
      url: absoluteUrl(`/purchase/${project.slug}`),
      type: "website",
    },
  };
}

export default async function PurchaseSlugPage({ params }: PageProps<"/purchase/[slug]">) {
  const { slug } = await params;

  const category = getCategory(slug);
  if (category) {
    return <CategoryExperience category={category} projects={getProjectsInCategory(category.slug)} />;
  }

  const project = getProject(slug);
  if (project) {
    return <ProjectDetail project={project} />;
  }

  notFound();
}
