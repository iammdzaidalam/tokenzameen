"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { DocumentRequestForm } from "@/components/forms/document-request-form";
import { Button } from "@/components/ui/button";
import { Overlay } from "@/components/ui/overlay";
import type { DocumentRef } from "@/types/catalog";

export function DocumentRequestButton({
  projectSlug,
  projectName,
  document,
}: {
  projectSlug: string;
  projectName: string;
  document: DocumentRef;
}) {
  const [open, setOpen] = useState(false);
  const label = document.gated ? "Request access" : "Request document";

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        {label}
        <ArrowUpRight aria-hidden className="size-3.5" />
      </Button>
      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        description={`${document.title} · ${projectName}`}
      >
        <div className="px-6 py-6">
          <DocumentRequestForm
            projectSlug={projectSlug}
            projectName={projectName}
            documentId={document.id}
            documentTitle={document.title}
          />
        </div>
      </Overlay>
    </>
  );
}
