import { Download, FileText, Lock } from "lucide-react";
import { PendingPanel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { DocumentRequestButton } from "@/components/property/detail/document-request-button";
import { RequestButton } from "@/components/property/detail/request-context";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { DOCUMENT_KIND_LABEL } from "@/lib/labels";
import type { Project } from "@/types/catalog";

export function DocumentsSection({ project, index }: { project: Project; index: string }) {
  return (
    <Section
      id="documents"
      tone="bone"
      aria-label={`${project.name} documents`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <SectionHeading
            index={index}
            eyebrow="Document vault"
            title="Read it for yourself"
            lead="Open documents download directly. Anything carrying commercial or legal detail opens once we know who is asking — that protects the developer and you."
          />

          {project.documents.length > 0 ? (
            <ul className="border-t border-[color:var(--hairline)]">
              {project.documents.map((document) => {
                const downloadable = document.href !== null && !document.gated;
                return (
                  <li
                    key={document.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-[color:var(--hairline)] py-4 sm:py-5"
                  >
                    <span
                      aria-hidden
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--surface)] text-[color:var(--accent)]"
                    >
                      {document.gated ? <Lock className="size-4" /> : <FileText className="size-4" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-subhead text-[0.9375rem] font-medium text-[color:var(--text-primary)]">
                        {document.title}
                      </h3>
                      <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                        {DOCUMENT_KIND_LABEL[document.kind]}
                        {document.gated
                          ? " · released after a short verification step"
                          : document.href
                            ? " · open document"
                            : " · not uploaded yet, an advisor will send it"}
                      </p>
                    </div>

                    {document.gated ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface)] px-2.5 py-1 text-[0.6875rem] font-medium text-[color:var(--text-secondary)]">
                        <Lock aria-hidden className="size-3" />
                        Gated
                      </span>
                    ) : null}

                    <div className="ml-auto shrink-0">
                      {downloadable && document.href ? (
                        <Button href={document.href} variant="ghost" size="sm">
                          Download
                          <Download aria-hidden className="size-3.5" />
                        </Button>
                      ) : (
                        <DocumentRequestButton
                          projectSlug={project.slug}
                          projectName={project.name}
                          document={document}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <PendingPanel
              title="The document set is being assembled"
              body="No documents have been released for this project yet. Tell us what you need to see and an advisor will confirm what can be shared and when."
              action={
                <RequestButton subject="the project document set" source="document-access" variant="solid">
                  Request documents
                </RequestButton>
              }
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
