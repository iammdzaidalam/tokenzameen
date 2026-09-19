import { Badge } from "@/components/ui/badge";
import type { LeadSource, LeadStage, LeadStatus, SiteVisitStatus } from "@/db/schema";
import { LEAD_SOURCE_LABEL, LEAD_STAGE_LABEL, LEAD_STATUS_LABEL } from "@/lib/leads";
import { UNIT_STATUS_LABEL } from "@/lib/labels";
import type { UnitStatus } from "@/types/catalog";

type Tone = "neutral" | "gold" | "success" | "warning" | "danger" | "outline";

/* The gold badge variant is tuned for dark surfaces; on the panel's white cards its text needs the darker gold. */
function toneClass(tone: Tone): string | undefined {
  return tone === "gold" ? "text-gold-600" : undefined;
}

const LEAD_STATUS_TONE: Record<LeadStatus, Tone> = {
  new: "gold",
  contacted: "neutral",
  qualified: "outline",
  "site-visit": "warning",
  negotiation: "warning",
  booking: "success",
  purchased: "success",
  lost: "danger",
};

const STAGE_TONE: Record<LeadStage, Tone> = {
  cold: "neutral",
  warm: "outline",
  hot: "warning",
  "purchase-ready": "success",
};

const VISIT_TONE: Record<SiteVisitStatus, Tone> = {
  requested: "gold",
  confirmed: "outline",
  completed: "success",
  cancelled: "danger",
};

const UNIT_TONE: Record<UnitStatus, Tone> = {
  available: "success",
  reserved: "warning",
  sold: "neutral",
};

export const SITE_VISIT_STATUS_LABEL: Record<SiteVisitStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function LeadStatusChip({ status }: { status: LeadStatus }) {
  const tone = LEAD_STATUS_TONE[status];
  return (
    <Badge tone={tone} className={toneClass(tone)}>
      {LEAD_STATUS_LABEL[status]}
    </Badge>
  );
}

export function StageChip({ stage }: { stage: LeadStage }) {
  const tone = STAGE_TONE[stage];
  return (
    <Badge tone={tone} className={toneClass(tone)}>
      {LEAD_STAGE_LABEL[stage]}
    </Badge>
  );
}

export function SourceChip({ source }: { source: LeadSource }) {
  return <Badge tone="neutral">{LEAD_SOURCE_LABEL[source]}</Badge>;
}

export function VisitStatusChip({ status }: { status: SiteVisitStatus }) {
  const tone = VISIT_TONE[status];
  return (
    <Badge tone={tone} className={toneClass(tone)}>
      {SITE_VISIT_STATUS_LABEL[status]}
    </Badge>
  );
}

export function UnitStatusChip({ status }: { status: UnitStatus }) {
  return <Badge tone={UNIT_TONE[status]}>{UNIT_STATUS_LABEL[status]}</Badge>;
}

export function BooleanChip({ value, yes, no }: { value: boolean; yes: string; no: string }) {
  return value ? <Badge tone="success">{yes}</Badge> : <Badge tone="warning">{no}</Badge>;
}
