export function cn(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(" "); }
export function formatMoney(value: string | number, currency = "INR", compact = false) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: Number(value) % 1 ? 2 : 0, notation: compact ? "compact" : "standard" }).format(Number(value));
}
export function monthLabel(year: number, month: number) { return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1)); }
export function shiftMonth(year: number, month: number, amount: number) { const value = new Date(year, month - 1 + amount, 1); return { year: value.getFullYear(), month: value.getMonth() + 1 }; }
