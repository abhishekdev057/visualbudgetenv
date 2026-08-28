import { describe, expect, it } from "vitest";
import { calculateSummary, envelopeStatus, moneyString, percentage } from "./finance";

describe("financial calculations", () => {
  it("calculates the acceptance-flow totals with exact decimals", () => {
    expect(calculateSummary("50000", ["8000", "15000", "10000"], ["1200", "14000"], ["10000"])).toEqual({
      income: "50000.00", totalAllocated: "33000.00", unallocated: "17000.00", totalSpent: "15200.00",
      available: "34800.00", savingsAllocation: "10000.00", savingsRate: 20,
    });
  });
  it("handles zero income and decimal values", () => {
    expect(percentage("10", "0")).toBe(0);
    expect(moneyString("0.105")).toBe("0.11");
  });
  it("classifies over-budget envelopes", () => {
    expect(envelopeStatus("100", "101").label).toBe("Over budget");
    expect(envelopeStatus("100", "100").label).toBe("Budget used");
  });
  it("keeps very large values exact and allows a fully allocated month", () => {
    expect(calculateSummary("9999999999999999.99", ["9999999999999999.99"], [], [])).toMatchObject({ totalAllocated: "9999999999999999.99", unallocated: "0.00", available: "9999999999999999.99" });
  });
  it("recalculates deterministically after edit and delete inputs", () => {
    expect(calculateSummary("1000", ["1000"], ["250.25"], [])).toMatchObject({ totalSpent: "250.25", available: "749.75" });
    expect(calculateSummary("1000", ["1000"], [], [])).toMatchObject({ totalSpent: "0.00", available: "1000.00" });
  });
});
