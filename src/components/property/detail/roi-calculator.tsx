"use client";

import { useState } from "react";
import { Disclaimer, Panel } from "@/components/property/detail/detail-primitives";
import { calculateRoi, leaseYearsFrom } from "@/components/property/detail/finance";
import { Field, TextInput } from "@/components/ui/field";
import { DISCLAIMERS } from "@/content/config";
import { formatAmount, formatPercent } from "@/lib/format";
import type { CommercialTerms } from "@/types/catalog";

const DEFAULT_VALUE = 10_000_000;
const DEFAULT_MONTHLY_RENT = 0;
const DEFAULT_LEASE_YEARS = 5;

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function RoiCalculator({ terms }: { terms: CommercialTerms | null }) {
  const startingValue = terms?.propertyValue?.amount ?? DEFAULT_VALUE;
  const startingRent = terms?.monthlyRent?.amount ?? DEFAULT_MONTHLY_RENT;
  const startingLease = leaseYearsFrom(terms?.leaseTenure ?? null) ?? DEFAULT_LEASE_YEARS;

  const [propertyValue, setPropertyValue] = useState(String(startingValue));
  const [monthlyRent, setMonthlyRent] = useState(String(startingRent));
  const [annualExpenses, setAnnualExpenses] = useState("0");
  const [leaseYears, setLeaseYears] = useState(String(startingLease));

  const result = calculateRoi({
    propertyValue: toNumber(propertyValue),
    monthlyRent: toNumber(monthlyRent),
    annualExpenses: toNumber(annualExpenses),
    leaseYears: toNumber(leaseYears),
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Property value (₹)"
          htmlFor="roi-value"
          hint={
            terms?.propertyValue
              ? "Prefilled from the terms published for this property."
              : "Your figure. No value is published for this property yet."
          }
          className="sm:col-span-2"
        >
          <TextInput
            id="roi-value"
            type="number"
            inputMode="numeric"
            min={0}
            step={100000}
            value={propertyValue}
            onChange={(event) => setPropertyValue(event.target.value)}
          />
        </Field>

        <Field
          label="Monthly rent (₹)"
          htmlFor="roi-rent"
          hint={terms?.monthlyRent ? "Prefilled from the published lease position." : "Your figure."}
        >
          <TextInput
            id="roi-rent"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            value={monthlyRent}
            onChange={(event) => setMonthlyRent(event.target.value)}
          />
        </Field>

        <Field
          label="Annual expenses (₹)"
          htmlFor="roi-expenses"
          hint="Maintenance, tax, insurance, vacancy — your estimate."
        >
          <TextInput
            id="roi-expenses"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            value={annualExpenses}
            onChange={(event) => setAnnualExpenses(event.target.value)}
          />
        </Field>

        <Field
          label="Lease period (years)"
          htmlFor="roi-lease"
          hint={terms?.leaseTenure ? `Stated lease: ${terms.leaseTenure}` : undefined}
          className="sm:col-span-2"
        >
          <TextInput
            id="roi-lease"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            step={1}
            value={leaseYears}
            onChange={(event) => setLeaseYears(event.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-5">
        <Panel className="flex flex-col gap-6">
          <p className="eyebrow text-[color:var(--text-muted)]">Indicative result</p>

          <dl aria-live="polite" className="grid grid-cols-2 gap-6">
            <div>
              <dt className="eyebrow text-[color:var(--text-muted)]">Indicative annual rent</dt>
              <dd className="tabular mt-2 font-display text-xl text-[color:var(--text-primary)]">
                {result ? formatAmount(Math.round(result.annualRent)) : "Enter a rent"}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-[color:var(--text-muted)]">Indicative net rental income</dt>
              <dd className="tabular mt-2 font-display text-xl text-[color:var(--text-primary)]">
                {result ? formatAmount(Math.round(result.netRentalIncome)) : "Enter a rent"}
              </dd>
            </div>
            <div className="border-t border-[color:var(--hairline)] pt-5">
              <dt className="eyebrow text-[color:var(--text-muted)]">Indicative gross yield</dt>
              <dd className="tabular mt-2 font-display text-display-sm text-[color:var(--accent)]">
                {result && result.grossYieldPercent !== null
                  ? formatPercent(result.grossYieldPercent)
                  : "Enter a value"}
              </dd>
            </div>
            <div className="border-t border-[color:var(--hairline)] pt-5">
              <dt className="eyebrow text-[color:var(--text-muted)]">Indicative net yield</dt>
              <dd className="tabular mt-2 font-display text-display-sm text-[color:var(--text-primary)]">
                {result && result.netYieldPercent !== null
                  ? formatPercent(result.netYieldPercent)
                  : "Enter a value"}
              </dd>
            </div>
            <div className="col-span-2 border-t border-[color:var(--hairline)] pt-5">
              <dt className="eyebrow text-[color:var(--text-muted)]">
                Indicative net income across the lease period
              </dt>
              <dd className="tabular mt-2 font-display text-xl text-[color:var(--text-primary)]">
                {result && result.netOverLease !== null
                  ? formatAmount(Math.round(result.netOverLease))
                  : "Enter a lease period"}
              </dd>
            </div>
          </dl>
        </Panel>

        <Disclaimer label="Calculator">{DISCLAIMERS.calculator}</Disclaimer>
        <Disclaimer label="Financial figures">{DISCLAIMERS.financial}</Disclaimer>
      </div>
    </div>
  );
}
