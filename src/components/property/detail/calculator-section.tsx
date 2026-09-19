import { SectionHeading, type Tint } from "@/components/property/detail/detail-primitives";
import { EmiCalculator } from "@/components/property/detail/emi-calculator";
import { RoiCalculator } from "@/components/property/detail/roi-calculator";
import {
  ACCENT_BY_CATEGORY,
  showsEmiCalculator,
  showsRoiCalculator,
} from "@/components/property/detail/sections";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function CalculatorSection({ project, index }: { project: Project; index: string }) {
  const emi = showsEmiCalculator(project);
  const roi = showsRoiCalculator(project);

  if (!emi && !roi) return null;

  const tint: Tint = ACCENT_BY_CATEGORY[project.primaryCategory];

  return (
    <Section tone="paper" aria-label={`${project.name} calculators`}>
      <Container width="wide">
        <SectionHeading
          index={index}
          eyebrow={roi ? "Rental maths" : "Payment planning"}
          title={roi ? "Work through the return" : "Work through the repayment"}
          lead="A planning aid, not a quote. Every input is yours, and every output is labelled indicative."
        />

        <div className="mt-12 flex flex-col gap-12">
          {roi ? <RoiCalculator terms={project.commercial} tint={tint} /> : null}
          {emi ? (
            <EmiCalculator publishedPrice={project.priceFrom} projectName={project.name} tint={tint} />
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
