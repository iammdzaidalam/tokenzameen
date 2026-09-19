"use client";

import { MasterplanPicker } from "@/components/property/detail/masterplan-picker";
import { RequestButton } from "@/components/property/detail/request-context";
import { STATUS_TONE, type InventoryGroup } from "@/components/property/detail/inventory-data";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { UNIT_STATUS_LABEL } from "@/lib/labels";
import type { MediaAsset, PlotUnit } from "@/types/catalog";

export function InventoryViews({
  groups,
  masterplan,
  plots,
}: {
  groups: InventoryGroup[];
  masterplan: MediaAsset | null;
  plots: PlotUnit[];
}) {
  const tables = <InventoryTables groups={groups} />;

  if (!masterplan || plots.length === 0) return tables;

  return (
    <Tabs
      items={[
        {
          id: "plan",
          label: "Masterplan",
          content: <MasterplanPicker masterplan={masterplan} plots={plots} />,
        },
        { id: "table", label: "Table", content: tables },
      ]}
    />
  );
}

function InventoryTables({ groups }: { groups: InventoryGroup[] }) {
  return (
    <div className="flex flex-col gap-12">
      {groups.map((group) => (
        <section key={group.kind} aria-label={group.heading}>
          {groups.length > 1 ? (
            <h3 className="font-subhead text-base font-medium text-[color:var(--text-primary)]">
              {group.heading}
            </h3>
          ) : null}

          <div className="mt-5 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                {group.heading}: {group.rows.length} entries
              </caption>
              <thead>
                <tr className="border-b border-[color:var(--hairline-strong)]">
                  <th scope="col" className="eyebrow py-3 pr-4 text-[color:var(--text-muted)]">
                    {group.titleLabel}
                  </th>
                  {group.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="eyebrow py-3 pr-4 text-[color:var(--text-muted)]"
                    >
                      {column}
                    </th>
                  ))}
                  <th scope="col" className="eyebrow py-3 pr-4 text-[color:var(--text-muted)]">
                    {group.statusLabel}
                  </th>
                  <th scope="col" className="py-3">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[color:var(--hairline)]">
                    <th
                      scope="row"
                      className="py-4 pr-4 font-normal text-[color:var(--text-primary)]"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        {row.title}
                        {row.sample ? (
                          <Badge tone="outline" className="uppercase tracking-wide">
                            Indicative
                          </Badge>
                        ) : null}
                      </span>
                    </th>
                    {row.cells.map((cell) => (
                      <td
                        key={cell.label}
                        className="tabular py-4 pr-4 text-[color:var(--text-secondary)]"
                      >
                        {cell.value}
                      </td>
                    ))}
                    <td className="py-4 pr-4">
                      <Badge tone={STATUS_TONE[row.status]}>{UNIT_STATUS_LABEL[row.status]}</Badge>
                    </td>
                    <td className="py-4 text-right">
                      <RequestButton
                        subject={`availability on ${group.titleLabel.toLowerCase()} ${row.title}`}
                        source="request-price"
                        variant="link"
                        size="sm"
                      >
                        Enquire
                      </RequestButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-5 flex flex-col gap-3 sm:hidden">
            {group.rows.map((row) => (
              <li
                key={row.id}
                className="rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-subhead text-base text-[color:var(--text-primary)]">
                    {group.titleLabel} {row.title}
                  </p>
                  <Badge tone={STATUS_TONE[row.status]}>{UNIT_STATUS_LABEL[row.status]}</Badge>
                </div>

                {row.sample ? (
                  <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Indicative row
                  </p>
                ) : null}

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  {row.cells.map((cell) => (
                    <div key={cell.label}>
                      <dt className="eyebrow text-[color:var(--text-muted)]">{cell.label}</dt>
                      <dd className="tabular mt-1 text-sm text-[color:var(--text-primary)]">
                        {cell.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <RequestButton
                  subject={`availability on ${group.titleLabel.toLowerCase()} ${row.title}`}
                  source="request-price"
                  variant="secondary"
                  size="sm"
                  className="mt-5"
                  full
                >
                  Enquire
                </RequestButton>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
