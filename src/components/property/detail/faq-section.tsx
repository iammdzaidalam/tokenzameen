import { SectionHeading } from "@/components/property/detail/detail-primitives";
import { RequestButton } from "@/components/property/detail/request-context";
import { Accordion } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/catalog";

export function FaqSection({ project, index }: { project: Project; index: string }) {
  return (
    <Section
      id="faqs"
      tone="paper"
      aria-label={`${project.name} questions`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
          <div>
            <SectionHeading index={index} eyebrow="FAQs" title="Questions buyers ask" />
            <div className="mt-8">
              <RequestButton subject="an answer to a question about this property">
                Ask something else
              </RequestButton>
            </div>
          </div>

          {project.faqs.length > 0 ? (
            <Accordion
              items={project.faqs.map((faq, position) => ({
                id: `faq-${position}`,
                title: faq.question,
                content: <p>{faq.answer}</p>,
              }))}
              defaultOpenId="faq-0"
            />
          ) : (
            <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
              No questions have been published for this project yet. Ask yours and the answer, once
              confirmed with the developer, is published here for the next buyer.
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
