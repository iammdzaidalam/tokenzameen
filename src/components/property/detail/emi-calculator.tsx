"use client";

import { useState } from "react";
import { Disclaimer, Panel, TintCard, type Tint } from "@/components/property/detail/detail-primitives";
import { calculateEmi } from "@/components/property/detail/finance";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { DISCLAIMERS } from "@/content/config";
import { formatAmount, formatMoneyExact } from "@/lib/format";
import type { Money } from "@/types/catalog";

const DEFAULT_DOWN_PAYMENT_SHARE = 0.2;
const DEFAULT_RATE = 8.5;
const DEFAULT_TENURE = 20;

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function EmiCalculator({
  publishedPrice,
  projectName,
  tint,
}: {
  publishedPrice: Money | null;
  projectName: string;
  tint: Tint;
}) {
  const startingPrice = publishedPrice?.amount ?? null;
  const [price, setPrice] = useState(startingPrice === null ? "" : String(startingPrice));
  const [downPayment, setDownPayment] = useState(
    startingPrice === null ? "" : String(Math.round(startingPrice * DEFAULT_DOWN_PAYMENT_SHARE)),
  );
  const [rate, setRate] = useState(String(DEFAULT_RATE));
  const [tenure, setTenure] = useState(String(DEFAULT_TENURE));

  const priceValue = toNumber(price);
  const downPaymentValue = toNumber(downPayment);
  const result = calculateEmi({
    price: priceValue,
    downPayment: downPaymentValue,
    annualRatePercent: toNumber(rate),
    tenureYears: toNumber(tenure),
  });

  const downPaymentShare =
    priceValue > 0 ? Math.round((downPaymentValue / priceValue) * 100) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <Panel className="flex flex-col gap-6">
        <div>
          <h3 className="font-subhead text-base font-medium text-[color:var(--text-primary)]">
            Residential EMI
          </h3>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            Every figure is yours to set. Nothing here is a quoted rate or a committed price.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Property price (₹)"
            htmlFor="emi-price"
            hint={
              publishedPrice
                ? "Prefilled from the published starting price. Change it to model your own figure."
                : "Your figure. No price is published for this project yet."
            }
            className="sm:col-span-2"
          >
            <TextInput
              id="emi-price"
              type="number"
              inputMode="numeric"
              min={0}
              step={100000}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </Field>

          <Field
            label="Down payment (₹)"
            htmlFor="emi-down-payment"
            hint={downPaymentShare === null ? undefined : `${downPaymentShare}% of the price above`}
          >
            <TextInput
              id="emi-down-payment"
              type="number"
              inputMode="numeric"
              min={0}
              step={100000}
              value={downPayment}
              onChange={(event) => setDownPayment(event.target.value)}
            />
          </Field>

          <Field label="Loan amount (₹)" htmlFor="emi-loan" hint="Price less down payment.">
            <TextInput
              id="emi-loan"
              readOnly
              value={formatMoneyExact({ amount: Math.max(0, priceValue - downPaymentValue), currency: "INR" })}
              className="cursor-default opacity-80"
            />
          </Field>

          <Field
            label="Interest rate (% per year)"
            htmlFor="emi-rate"
            hint="Your assumption, not a quoted rate."
          >
            <TextInput
              id="emi-rate"
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={0.05}
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </Field>

          <Field label="Loan tenure (years)" htmlFor="emi-tenure">
            <TextInput
              id="emi-tenure"
              type="number"
              inputMode="numeric"
              min={1}
              max={40}
              step={1}
              value={tenure}
              onChange={(event) => setTenure(event.target.value)}
            />
          </Field>
        </div>

        {publishedPrice ? (
          <Button
            variant="link"
            size="sm"
            className="self-start"
            onClick={() => {
              setPrice(String(publishedPrice.amount));
              setDownPayment(String(Math.round(publishedPrice.amount * DEFAULT_DOWN_PAYMENT_SHARE)));
            }}
          >
            Reset to the published price for {projectName}
          </Button>
        ) : null}
      </Panel>

      <div className="flex flex-col gap-4">
        <div aria-live="polite">
          {result ? (
            <dl className="grid grid-cols-2 gap-4">
              <TintCard
                label="Indicative monthly EMI"
                value={formatMoneyExact({ amount: Math.round(result.emi), currency: "INR" })}
                note={`over ${result.months} monthly instalments`}
                tint={tint}
                emphasis
                className="col-span-2"
              />
              <TintCard
                label="Indicative total interest"
                value={formatAmount(Math.round(result.totalInterest))}
                tint="steel"
              />
              <TintCard
                label="Indicative total payable"
                value={formatAmount(Math.round(result.totalPayable))}
                tint="steel"
              />
            </dl>
          ) : (
            <Panel>
              <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
                Enter a loan amount above zero and a tenure of at least one year to see an indicative
                repayment.
              </p>
            </Panel>
          )}
        </div>

        <Disclaimer label="Calculator">{DISCLAIMERS.calculator}</Disclaimer>
        <Disclaimer label="Financial figures">{DISCLAIMERS.financial}</Disclaimer>
      </div>
    </div>
  );
}
