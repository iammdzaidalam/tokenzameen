"use client";

import { CountUp } from "@/components/motion/count-up";
import { formatAmount, formatPercent } from "@/lib/format";

export function MoneyCountUp({ amount, className }: { amount: number; className?: string }) {
  return <CountUp to={amount} format={formatAmount} className={className} />;
}

export function PercentCountUp({ value, className }: { value: number; className?: string }) {
  return <CountUp to={value} format={(current) => formatPercent(current)} className={className} />;
}
