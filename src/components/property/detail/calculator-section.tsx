import { SectionHeading } from "@/components/property/detail/detail-primitives";
import { EmiCalculator } from "@/components/property/detail/emi-calculator";
import { RoiCalculator } from "@/components/property/detail/roi-calculator";
import { showsEmiCalculator, showsRoiCalculator } from "@/components/property/detail/sections";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function CalculatorSection({ project }: { project: Project }) {
  const emi = showsEmiCalculator(project);
  const roi = showsRoiCalculator(project);

  if (!emi && !roi) return null;

  return (
    <Section tone="light" aria-label={`${project.name} calculators`}>
      <Container width="wide">
        <SectionHeading
          eyebrow={roi ? "Rental maths" : "Payment planning"}
          title={roi ? "Work through the return" : "Work through the repayment"}
          lead="Every figure below is yours to set. Nothing here is a quoted rate, an agreed rent or a committed price for this property."
        />

        <div className="mt-12 flex flex-col gap-16">
          {roi ? <RoiCalculator terms={project.commercial} /> : null}
          {emi ? (
            <EmiCalculator publishedPrice={project.priceFrom} projectName={project.name} />
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
