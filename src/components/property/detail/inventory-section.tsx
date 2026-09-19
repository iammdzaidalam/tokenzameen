import { Disclaimer, PendingPanel, SectionHeading } from "@/components/property/detail/detail-primitives";
import { toInventoryGroups } from "@/components/property/detail/inventory-data";
import { InventoryViews } from "@/components/property/detail/inventory-views";
import { RequestButton } from "@/components/property/detail/request-context";
import { hasSampleRows, plottedUnits, visibleInventory } from "@/components/property/detail/sections";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { DISCLAIMERS } from "@/content/config";
import type { Project } from "@/types/catalog";

export function InventorySection({ project }: { project: Project }) {
  const units = visibleInventory(project);
  const groups = toInventoryGroups(units);
  const plots = plottedUnits(units);
  const masterplan = project.masterplan;
  const showsSample = hasSampleRows(units);

  const title = masterplan ? "Masterplan and availability" : "Available inventory";

  return (
    <Section
      id="inventory"
      tone="dark"
      aria-label={`${project.name} inventory`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <SectionHeading
          eyebrow="Inventory"
          title={title}
          lead={
            groups.length > 0
              ? "Pick from the plan or work down the table — both carry the same information, and both lead to the same advisor."
              : undefined
          }
        />

        {groups.length > 0 ? (
          <div className="mt-10 flex flex-col gap-8">
            {showsSample ? (
              <Disclaimer label="Indicative inventory">{DISCLAIMERS.sampleInventory}</Disclaimer>
            ) : null}
            <InventoryViews groups={groups} masterplan={masterplan} plots={plots} />
          </div>
        ) : (
          <PendingPanel
            className="mt-10 max-w-3xl"
            title="Availability released on request"
            body="The developer has not released a live availability sheet for this project. An advisor can send you the current position, unit by unit, along with what is genuinely open today."
            action={
              <RequestButton subject="the current availability sheet" source="request-price" variant="primary">
                Request availability
              </RequestButton>
            }
          />
        )}
      </Container>
    </Section>
  );
}
