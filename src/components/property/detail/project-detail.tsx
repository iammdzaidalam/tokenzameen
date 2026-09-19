import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <Section space="xl">
      <Container>
        <h1 className="text-display-xl">{project.name}</h1>
        <p className="mt-6 max-w-2xl text-lg text-steel-300">{project.positioning}</p>
      </Container>
    </Section>
  );
}
