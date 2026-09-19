import { Download, FileText, Lock } from "lucide-react";
import { PendingPanel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { DocumentRequestButton } from "@/components/property/detail/document-request-button";
import { RequestButton } from "@/components/property/detail/request-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { DOCUMENT_KIND_LABEL } from "@/lib/labels";
import type { Project } from "@/types/catalog";

export function DocumentsSection({ project }: { project: Project }) {
  return (
    <Section
      id="documents"
      tone="darker"
      aria-label={`${project.name} documents`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <SectionHeading
          eyebrow="Document vault"
          title="Read it for yourself"
          lead="Open documents download directly. Anything carrying commercial or legal detail opens once we know who is asking — that protects the developer and you."
        />

        {project.documents.length > 0 ? (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.documents.map((document) => {
              const downloadable = document.href !== null && !document.gated;
              return (
                <li
                  key={document.id}
                  className="flex flex-col gap-5 rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden
                      className="grid size-10 place-items-center rounded-full border border-[color:var(--hairline-strong)] text-[color:var(--accent)]"
                    >
                      {document.gated ? <Lock className="size-4" /> : <FileText className="size-4" />}
                    </span>
                    <Badge tone="neutral">{DOCUMENT_KIND_LABEL[document.kind]}</Badge>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-subhead text-base font-medium text-[color:var(--text-primary)]">
                      {document.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-secondary)]">
                      {document.gated
                        ? "Released after a short verification step."
                        : document.href
                          ? "Open document."
                          : "Not uploaded yet — an advisor will send it."}
                    </p>
                  </div>

                  {downloadable && document.href ? (
                    <Button href={document.href} variant="secondary" size="sm" full>
                      <Download aria-hidden className="size-3.5" />
                      Download
                    </Button>
                  ) : (
                    <DocumentRequestButton
                      projectSlug={project.slug}
                      projectName={project.name}
                      document={document}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <PendingPanel
            className="mt-12 max-w-3xl"
            title="The document set is being assembled"
            body="No documents have been released for this project yet. Tell us what you need to see and an advisor will confirm what can be shared and when."
            action={
              <RequestButton subject="the project document set" source="document-access" variant="primary">
                Request documents
              </RequestButton>
            }
          />
        )}
      </Container>
    </Section>
  );
}
