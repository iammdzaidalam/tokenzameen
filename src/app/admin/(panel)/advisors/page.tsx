import type { Metadata } from "next";
import { listAdvisors } from "@/db/repositories";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, CardHeader } from "@/components/admin/card";
import { BooleanChip } from "@/components/admin/chips";
import { formatDateTime } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/components/admin/require-admin";
import { DataError, EmptyRows, NoDatabase } from "@/components/admin/states";
import { Table, Td, Th, Tr } from "@/components/admin/table";
import { Field, TextInput } from "@/components/ui/field";
import { env } from "@/lib/env";
import { saveAdvisorAction, setAdvisorActiveAction } from "./actions";

export const metadata: Metadata = { title: "Advisors" };

export default async function AdvisorsPage() {
  await requireAdmin();

  const header = (
    <PageHeader
      index="06"
      eyebrow="Advisors"
      title="Who leads can be assigned to."
      lead="Deactivating an advisor removes them from the assignment list without touching the leads they already hold."
    />
  );

  if (!env.hasDatabase) {
    return (
      <>
        {header}
        <NoDatabase section="Advisors" />
      </>
    );
  }

  const result = await listAdvisors();

  return (
    <>
      {header}
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        {result.ok ? (
          result.data.length === 0 ? (
            <Card>
              <EmptyRows
                title="No advisors yet"
                body="Add the first advisor with the form. pnpm db:seed also creates one when SEED_ADVISOR_EMAIL is set."
              />
            </Card>
          ) : (
            <Table caption="Advisors" minWidth="min-w-[48rem]">
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Status</Th>
                  <Th>Added</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((advisor) => (
                  <Tr key={advisor.id}>
                    <Td className="font-medium">{advisor.name}</Td>
                    <Td>
                      <a href={`mailto:${advisor.email}`} className="underline-offset-4 hover:underline">
                        {advisor.email}
                      </a>
                    </Td>
                    <Td className="tabular" muted>
                      {advisor.phone ?? "—"}
                    </Td>
                    <Td>
                      <BooleanChip value={advisor.active} yes="Active" no="Inactive" />
                    </Td>
                    <Td muted className="whitespace-nowrap">
                      {formatDateTime(advisor.createdAt)}
                    </Td>
                    <Td>
                      <ActionForm action={setAdvisorActiveAction} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="advisorId" value={advisor.id} />
                        <input type="hidden" name="active" value={advisor.active ? "false" : "true"} />
                        <SubmitButton variant={advisor.active ? "ghost" : "secondary"} pendingLabel="Saving…">
                          {advisor.active ? "Deactivate" : "Reactivate"}
                        </SubmitButton>
                      </ActionForm>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )
        ) : (
          <DataError message={result.error.message} context="advisors" />
        )}

        <Card as="section" aria-label="Add an advisor">
          <CardHeader title="Add an advisor" note="Saving an existing email updates the name and phone and reactivates them." />
          <div className="p-6">
            <ActionForm action={saveAdvisorAction} className="flex flex-col gap-4">
              <Field label="Name" htmlFor="advisor-name" required>
                <TextInput id="advisor-name" name="name" required maxLength={80} autoComplete="off" />
              </Field>
              <Field label="Email" htmlFor="advisor-email" required>
                <TextInput id="advisor-email" name="email" type="email" required maxLength={160} autoComplete="off" />
              </Field>
              <Field label="Mobile" htmlFor="advisor-phone" hint="Indian mobile number; stored as +91.">
                <TextInput id="advisor-phone" name="phone" type="tel" inputMode="tel" autoComplete="off" />
              </Field>
              <div>
                <SubmitButton pendingLabel="Saving…">Save advisor</SubmitButton>
              </div>
            </ActionForm>
          </div>
        </Card>
      </div>
    </>
  );
}
