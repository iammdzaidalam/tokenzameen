export interface EmiInputs {
  price: number;
  downPayment: number;
  annualRatePercent: number;
  tenureYears: number;
}

export interface EmiResult {
  loanAmount: number;
  emi: number;
  totalInterest: number;
  totalPayable: number;
  months: number;
}

/** Standard amortisation. A zero rate degrades to a straight-line repayment. */
export function calculateEmi({ price, downPayment, annualRatePercent, tenureYears }: EmiInputs): EmiResult | null {
  const loanAmount = price - downPayment;
  const months = Math.round(tenureYears * 12);
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(months) || months <= 0) return null;

  const monthlyRate = annualRatePercent / 12 / 100;
  const emi =
    monthlyRate <= 0
      ? loanAmount / months
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  if (!Number.isFinite(emi)) return null;

  const totalPayable = emi * months;
  return {
    loanAmount,
    emi,
    totalInterest: totalPayable - loanAmount,
    totalPayable,
    months,
  };
}

export interface RoiInputs {
  propertyValue: number;
  monthlyRent: number;
  annualExpenses: number;
  leaseYears: number;
}

export interface RoiResult {
  annualRent: number;
  netRentalIncome: number;
  grossYieldPercent: number | null;
  netYieldPercent: number | null;
  netOverLease: number | null;
}

export function calculateRoi({ propertyValue, monthlyRent, annualExpenses, leaseYears }: RoiInputs): RoiResult | null {
  if (!Number.isFinite(monthlyRent) || monthlyRent < 0) return null;
  if (!Number.isFinite(annualExpenses) || annualExpenses < 0) return null;

  const annualRent = monthlyRent * 12;
  const netRentalIncome = annualRent - annualExpenses;
  const usableValue = Number.isFinite(propertyValue) && propertyValue > 0 ? propertyValue : null;

  return {
    annualRent,
    netRentalIncome,
    grossYieldPercent: usableValue === null ? null : (annualRent / usableValue) * 100,
    netYieldPercent: usableValue === null ? null : (netRentalIncome / usableValue) * 100,
    netOverLease: Number.isFinite(leaseYears) && leaseYears > 0 ? netRentalIncome * leaseYears : null,
  };
}

/** Reads the leading year count out of a stated lease tenure such as "5 years, post-dated cheques". */
export function leaseYearsFrom(leaseTenure: string | null): number | null {
  if (!leaseTenure) return null;
  const match = leaseTenure.match(/(\d+)\s*year/i);
  if (!match) return null;
  const years = Number.parseInt(match[1], 10);
  return Number.isFinite(years) && years > 0 ? years : null;
}
