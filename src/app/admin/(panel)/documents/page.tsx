import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/components/admin/require-admin";
import { LaterPhase } from "@/components/admin/states";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader index="08" eyebrow="Documents" title="Brochures, plans and approvals." />
      <LaterPhase
        section="Documents"
        summary="Every project lists its documents in the content file today, most with href: null, which the property page turns into a request-access flow. This section will hold the files themselves and the record of who was sent what."
        holds={[
          "Uploads for brochures, floor plans, price lists, payment plans, RERA certificates and legal papers, per project",
          "Whether a document is gated, and the email it was sent to when a buyer requested it",
          "Replacing each href: null entry in src/content/projects.ts with the hosted file",
          "Versioning, so a superseded price list is kept but no longer served",
        ]}
        dependsOn={[
          "File storage: next.config.ts already allows *.public.blob.vercel-storage.com",
          "A documents table and repository functions; document requests are recorded as lead events today",
          "A decision on who may download gated documents without an advisor's involvement",
        ]}
      />
    </>
  );
}
