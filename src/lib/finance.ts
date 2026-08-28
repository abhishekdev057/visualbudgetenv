import Decimal from "decimal.js";

Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP });
export type MoneyInput = string | number | Decimal;

export function money(value: MoneyInput = "0") {
  return new Decimal(value || 0).toDecimalPlaces(2);
}

export function moneyString(value: MoneyInput = "0") {
  return money(value).toFixed(2);
}

export function sumMoney(values: MoneyInput[]) {
  return moneyString(values.reduce<Decimal>((sum, value) => sum.plus(value), new Decimal(0)));
}

export function percentage(numerator: MoneyInput, denominator: MoneyInput) {
  const base = money(denominator);
  if (base.isZero()) return 0;
  return Number(money(numerator).div(base).times(100).toDecimalPlaces(1));
}

export function calculateSummary(income: MoneyInput, allocations: MoneyInput[], expenses: MoneyInput[], savings: MoneyInput[] = []) {
  const totalAllocated = money(sumMoney(allocations));
  const totalSpent = money(sumMoney(expenses));
  const savingsAllocation = money(sumMoney(savings));
  return {
    income: moneyString(income),
    totalAllocated: totalAllocated.toFixed(2),
    unallocated: money(income).minus(totalAllocated).toFixed(2),
    totalSpent: totalSpent.toFixed(2),
    available: money(income).minus(totalSpent).toFixed(2),
    savingsAllocation: savingsAllocation.toFixed(2),
    savingsRate: percentage(savingsAllocation, income),
  };
}

export function envelopeStatus(allocated: MoneyInput, spent: MoneyInput) {
  const used = percentage(spent, allocated);
  if (used > 100) return { used, label: "Over budget", tone: "danger" as const };
  if (used === 100) return { used, label: "Budget used", tone: "danger" as const };
  if (used > 90) return { used, label: "Almost used", tone: "warning" as const };
  if (used > 70) return { used, label: "Watch spending", tone: "warning" as const };
  return { used, label: "On track", tone: "success" as const };
}
