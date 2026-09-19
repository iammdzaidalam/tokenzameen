import Link from "next/link";
import { enquiryHref } from "@/components/discovery/advisory";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { TileArrow } from "@/components/ui/tile-arrow";

/** The steps are the ones PRD 02 section 23 sets out, pointing only at surfaces
 *  that exist today. */
const STEPS = [
  {
    index: "01",
    title: "Save",
    body: "Keep the ones worth a second look on your shortlist.",
    href: "/purchase/shortlist",
  },
  {
    index: "02",
    title: "Compare",
    body: "Put up to four side by side and see what actually separates them.",
    href: "/purchase/compare",
  },
  {
    index: "03",
    title: "Talk to an advisor",
    body: "Bring the two or three you are torn between to a conversation.",
    href: enquiryHref(),
  },
];

export function AdvisoryBand({ heading }: { heading: string }) {
  return (
    <Section tone="darker" space="lg" aria-labelledby="discovery-advisory">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-end lg:gap-20">
          <div>
            <IndexLabel>Advisory</IndexLabel>
            <h2 id="discovery-advisory" className="mt-5 text-balance text-display-lg">
              {heading}
            </h2>
          </div>
          <div className="lg:pb-2">
            <p className="max-w-xl text-pretty leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
              Tell us your requirements. Our property advisors will help you navigate the
              TokenZameen collection.
            </p>
            <Button href={enquiryHref()} variant="solid" size="lg" className="mt-7">
              Talk to an Advisor
            </Button>
          </div>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-card bg-[color:var(--hairline)] sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.index} className="bg-[color:var(--surface)]">
              <Link
                href={step.href}
                className="group flex h-full flex-col justify-between gap-10 p-6 transition-colors duration-500 hover:bg-white/[0.04] sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="tabular text-sm text-[color:var(--accent)]">/{step.index}</span>
                  <TileArrow tone="accent" size="sm" />
                </div>
                <div>
                  <span className="block font-display text-xl text-[color:var(--text-primary)]">
                    {step.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-[color:var(--text-secondary)]">
                    {step.body}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
