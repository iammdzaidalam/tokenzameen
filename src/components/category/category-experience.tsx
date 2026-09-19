import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Category, Project } from "@/types/catalog";

export function CategoryExperience({
  category,
  projects,
}: {
  category: Category;
  projects: Project[];
}) {
  return (
    <Section space="xl">
      <Container>
        <h1 className="text-display-xl">{category.heroHeadline}</h1>
        <p className="mt-6 max-w-2xl text-lg text-steel-300">{category.heroSubline}</p>
        <p className="mt-10 text-sm text-steel-500">{projects.length} projects</p>
      </Container>
    </Section>
  );
}
