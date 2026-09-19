import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { SITE } from "@/content/config";
import { cn } from "@/lib/cn";

export const LEGAL_DOCUMENTS = [
  { slug: "terms", title: "Terms of Use" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "disclaimer", title: "Disclaimer" },
] as const;

export type LegalSlug = (typeof LEGAL_DOCUMENTS)[number]["slug"];

export type LegalBlock = string | { list: string[] };

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

/** Every legal page carries the day it was last changed, in plain words. */
export const LEGAL_UPDATED = "20 September 2026";

export function LegalArticle({
  slug,
  title,
  summary,
  sections,
}: {
  slug: LegalSlug;
  title: string;
  summary: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Section tone="bone" space="none" aria-labelledby="legal-heading" className="pb-12 pt-10 sm:pb-16 sm:pt-16">
        <Container width="wide">
          <Eyebrow withRule>Legal</Eyebrow>
          <h1 id="legal-heading" className="mt-5 max-w-3xl text-balance text-display-xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
            {summary}
          </p>
          <p className="mt-6 text-xs text-[color:var(--text-muted)]">Last updated {LEGAL_UPDATED}.</p>
        </Container>
      </Section>

      <Section tone="paper" space="lg">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-20">
            <nav aria-label="Legal documents" className="lg:sticky lg:top-24 lg:self-start">
              <p className="eyebrow text-[color:var(--text-muted)]">Documents</p>
              <ul className="mt-4 border-t border-[color:var(--hairline)]">
                {LEGAL_DOCUMENTS.map((document) => {
                  const current = document.slug === slug;
                  return (
                    <li key={document.slug} className="border-b border-[color:var(--hairline)]">
                      <Link
                        href={`/legal/${document.slug}`}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 items-center py-3 text-sm transition-colors",
                          current
                            ? "text-[color:var(--text-primary)]"
                            : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                        )}
                      >
                        {document.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <p className="eyebrow mt-10 text-[color:var(--text-muted)]">On this page</p>
              <ol className="mt-4 space-y-2">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex gap-3 text-sm text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]"
                    >
                      <span className="tabular text-[color:var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <article className="max-w-3xl">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-24 border-t border-[color:var(--hairline)] py-10 first:border-t-0 first:pt-0"
                >
                  <span className="eyebrow tabular text-[color:var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
                  <h2 id={`${section.id}-heading`} className="mt-3 text-display-sm text-[color:var(--text-primary)]">
                    {section.heading}
                  </h2>
                  <div className="mt-5 space-y-4 text-[0.9375rem] leading-relaxed text-[color:var(--text-secondary)]">
                    {section.blocks.map((block, blockIndex) =>
                      typeof block === "string" ? (
                        <p key={blockIndex} className="text-pretty">
                          {block}
                        </p>
                      ) : (
                        <ul key={blockIndex} className="space-y-2 pl-5">
                          {block.list.map((item) => (
                            <li key={item} className="list-disc text-pretty marker:text-[color:var(--accent)]">
                              {item}
                            </li>
                          ))}
                        </ul>
                      ),
                    )}
                  </div>
                </section>
              ))}

              <p className="border-t border-[color:var(--hairline)] pt-8 text-sm leading-relaxed text-[color:var(--text-muted)]">
                Questions about this document go to a TokenZameen advisor
                {SITE.advisorEmail ? (
                  <>
                    {" "}
                    at{" "}
                    <a href={`mailto:${SITE.advisorEmail}`} className="text-[color:var(--accent)] underline-offset-4 hover:underline">
                      {SITE.advisorEmail}
                    </a>
                  </>
                ) : (
                  <>
                    {" "}
                    through the{" "}
                    <Link href="/contact" className="text-[color:var(--accent)] underline-offset-4 hover:underline">
                      contact page
                    </Link>
                  </>
                )}
                .
              </p>
            </article>
          </div>
        </Container>
      </Section>
    </>
  );
}
