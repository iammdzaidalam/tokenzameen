import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { StatGrid, type Stat } from "@/components/ui/stat-grid";
import { categories, getAllCities, getAllProjects } from "@/lib/catalog";

export function EditorialIntro() {
  const cities = getAllCities();
  const stats: Stat[] = [
    {
      value: getAllProjects().length,
      label: "Projects in the collection",
      note: "Across the six collections",
    },
    {
      value: categories.length,
      label: "Property collections",
      note: categories.map((category) => category.shortName).join(" · "),
    },
    {
      value: cities.length,
      label: "Cities and regions covered",
      note: cities.join(", "),
    },
  ];

  return (
    <Section tone="paper" aria-label="Why TokenZameen" space="lg">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <IndexLabel index="01">The approach</IndexLabel>
            <h2 className="mt-6 max-w-[12ch] text-display-lg text-[color:var(--text-primary)]">
              Curation before search.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="lg:pt-10">
            <p className="text-lg leading-relaxed text-[color:var(--text-secondary)] sm:text-xl sm:leading-relaxed">
              TokenZameen is not a listings portal. Every project is organised the same way — what
              is known, what is still being compiled, and who to ask — so the shortlist you leave
              with is short for a reason.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <StatGrid stats={stats} columns={3} invertIndex={1} className="mt-14 lg:mt-20" />
        </Reveal>
      </Container>
    </Section>
  );
}
