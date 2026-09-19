import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Card, CardHeader, Notice } from "@/components/admin/card";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/components/admin/require-admin";
import { Table, Td, Th, Tr } from "@/components/admin/table";
import { Badge } from "@/components/ui/badge";
import { StatGrid, type Stat } from "@/components/ui/stat-grid";
import { getAllProjects } from "@/lib/catalog";
import { formatDate, formatPriceFrom } from "@/lib/format";
import { AVAILABILITY_LABEL, CATEGORY_LABEL } from "@/lib/labels";
import type { VerifiedFacets } from "@/types/catalog";

export const metadata: Metadata = { title: "Projects" };

const FACETS: Array<{ key: keyof VerifiedFacets; label: string }> = [
  { key: "project", label: "Project" },
  { key: "developer", label: "Developer" },
  { key: "location", label: "Location" },
  { key: "documentation", label: "Documentation" },
  { key: "pricing", label: "Pricing" },
  { key: "inventory", label: "Inventory" },
];

function FacetChips({ verified }: { verified: VerifiedFacets }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {FACETS.map((facet) => {
        const on = verified[facet.key];
        return (
          <Badge key={facet.key} tone={on ? "success" : "neutral"}>
            {on ? <Check aria-hidden className="size-3" /> : <Minus aria-hidden className="size-3" />}
            {facet.label}
            <span className="sr-only">{on ? " verified" : " not verified"}</span>
          </Badge>
        );
      })}
    </span>
  );
}

export default async function ProjectsPage() {
  await requireAdmin();
  const projects = getAllProjects();

  const fullyVerified = projects.filter((project) => FACETS.every((facet) => project.verified[facet.key]));
  const withPending = projects.filter((project) => project.pendingInformation.length > 0);
  const pendingItems = projects.reduce((sum, project) => sum + project.pendingInformation.length, 0);

  const stats: Stat[] = [
    { value: projects.length, label: "Projects in the catalogue" },
    { value: fullyVerified.length, label: "Verified on all six facets" },
    { value: withPending.length, label: "Projects with information still awaited" },
    { value: pendingItems, label: "Awaited items in total" },
  ];

  return (
    <>
      <PageHeader
        index="05"
        eyebrow="Projects"
        title="What the catalogue says, and what it still lacks."
        lead="A read-only view of the published catalogue with each project's verified facets and the information the project owner has not supplied yet."
      />

      <Notice className="mt-8">
        Project content is edited in <code className="font-mono">src/content/projects.ts</code> and gated by{" "}
        <code className="font-mono">pnpm check:data</code>, which fails on any figure the brief does not
        supply. There is deliberately no editor here: a change to a price or a RERA number is a code
        review, not a form field.
      </Notice>

      <section aria-label="Catalogue counts" className="mt-8">
        <StatGrid stats={stats} invertIndex={1} columns={4} />
      </section>

      <section aria-label="Projects" className="mt-8">
        <Table caption="Projects" minWidth="min-w-[88rem]">
          <thead>
            <tr>
              <Th>Project</Th>
              <Th>Category</Th>
              <Th>Availability</Th>
              <Th>Price from</Th>
              <Th>Verified facets</Th>
              <Th align="right">Awaited</Th>
              <Th>Inventory rows</Th>
              <Th>Documents</Th>
              <Th>Intelligence</Th>
              <Th>Updated</Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const sampleUnits = project.inventory.filter((unit) => unit.sample).length;
              const hosted = project.documents.filter((document) => document.href !== null).length;
              return (
                <Tr key={project.slug}>
                  <Td>
                    <Link
                      href={`/purchase/${project.slug}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {project.name}
                    </Link>
                    <span className="block font-mono text-xs text-[color:var(--text-muted)]">{project.slug}</span>
                  </Td>
                  <Td muted>{CATEGORY_LABEL[project.primaryCategory]}</Td>
                  <Td muted>{AVAILABILITY_LABEL[project.availability]}</Td>
                  <Td className="whitespace-nowrap">{formatPriceFrom(project.priceFrom)}</Td>
                  <Td>
                    <FacetChips verified={project.verified} />
                  </Td>
                  <Td align="right" className="tabular">
                    {project.pendingInformation.length}
                  </Td>
                  <Td muted className="whitespace-nowrap">
                    {project.inventory.length} in content
                    {sampleUnits > 0 ? ` (${sampleUnits} indicative)` : ""}
                  </Td>
                  <Td muted className="whitespace-nowrap">
                    {hosted} hosted / {project.documents.length - hosted} awaiting file
                  </Td>
                  <Td>
                    {project.intelligence ? (
                      <Badge tone="success">Assessed {formatDate(project.intelligence.assessedOn)}</Badge>
                    ) : (
                      <Badge tone="warning">Awaiting assessment</Badge>
                    )}
                  </Td>
                  <Td muted className="whitespace-nowrap">
                    {formatDate(project.lastUpdated)}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </section>

      {withPending.length > 0 ? (
        <section aria-label="Information being compiled" className="mt-8 grid gap-6 lg:grid-cols-2">
          {withPending.map((project) => (
            <Card key={project.slug}>
              <CardHeader
                title={project.name}
                note={`${project.pendingInformation.length} item${project.pendingInformation.length === 1 ? "" : "s"} the project owner has not supplied`}
              />
              <ul className="divide-y divide-[color:var(--hairline)] px-6">
                {project.pendingInformation.map((item) => (
                  <li key={item} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span>{item}</span>
                    <span className="shrink-0 text-xs text-[color:var(--text-muted)]">Awaited</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </section>
      ) : null}
    </>
  );
}
