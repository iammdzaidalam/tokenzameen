import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/components/admin/require-admin";
import { LaterPhase } from "@/components/admin/states";

export const metadata: Metadata = { title: "Content" };

export default async function ContentPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader index="10" eyebrow="Content" title="Editing what the site says." />
      <LaterPhase
        section="Content"
        summary="Project copy, USPs, FAQs, amenities and the category and intent pages are code today, reviewed like code and checked by pnpm check:data before they ship. Moving them into an editor is a later phase because the linter has to move with them."
        holds={[
          "Project overview, USPs, why-this-project, highlights, amenities and FAQs",
          "Category and intent copy, hero lines and audience notes",
          "Image and gallery captions, and the swap from generated artwork to photography",
          "A publish step that runs the content checks before anything goes live",
        ]}
        dependsOn={[
          "Moving the catalogue out of src/content/projects.ts into a table or a CMS",
          "Running the fabrication checks in scripts/check-content.ts server-side on save",
          "A preview of the property page before publishing",
        ]}
      />
    </>
  );
}
