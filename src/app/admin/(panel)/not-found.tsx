import { Button } from "@/components/ui/button";
import { Card } from "@/components/admin/card";
import { PageHeader } from "@/components/admin/page-header";

export default function AdminNotFound() {
  return (
    <>
      <PageHeader index="—" eyebrow="Not found" title="There is no record at this address." />
      <Card className="mt-8 p-8">
        <p className="text-sm text-[color:var(--text-secondary)]">
          The link may be stale, or the row was removed. Nothing has been changed.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/admin/leads" variant="solid" size="sm">
            Back to leads
          </Button>
          <Button href="/admin" variant="secondary" size="sm">
            Dashboard
          </Button>
        </div>
      </Card>
    </>
  );
}
