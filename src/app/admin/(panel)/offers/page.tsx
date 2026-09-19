import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/components/admin/require-admin";
import { LaterPhase } from "@/components/admin/states";

export const metadata: Metadata = { title: "Offers" };

export default async function OffersPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader index="09" eyebrow="Offers" title="Time-boxed offers and investment metrics." />
      <LaterPhase
        section="Offers"
        summary="PRD 01 §33 asks the panel to add offers and investment metrics to a property. Neither has a table yet, and the data-honesty rule means an offer cannot be typed in without a source, so this section waits for the schema and the review step."
        holds={[
          "Offers per project or per unit with a start and end date, shown on the property page only while live",
          "Investment metrics the team has verified, with the document each figure comes from",
          "A history of past offers so a page never shows one that has lapsed",
        ]}
        dependsOn={[
          "An offers table and repository functions",
          "The verified-facts rule: every figure needs a source the linter can check",
          "A place on the project page's investment snapshot to render a live offer",
        ]}
      />
    </>
  );
}
