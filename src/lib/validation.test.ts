import { describe, expect, it } from "vitest";
import { accountDeleteSchema, budgetCreateSchema, transactionInputSchema, transactionQuerySchema } from "./validation";

describe("validation", () => {
  it("rejects negative income", () => expect(budgetCreateSchema.safeParse({ year: 2026, month: 8, income: "-1" }).success).toBe(false));
  it("rejects zero expenses and invalid IDs", () => expect(transactionInputSchema.safeParse({ budgetMonthId: "x", envelopeId: "x", title: "Food", amount: "0", transactionDate: new Date() }).success).toBe(false));
  it("accepts precise money", () => expect(budgetCreateSchema.safeParse({ year: 2026, month: 8, income: "999999999.99", envelopes: [] }).success).toBe(true));
  it("rejects more than two decimals and database-overflow amounts", () => {
    expect(budgetCreateSchema.safeParse({ year: 2026, month: 8, income: "1.001", envelopes: [] }).success).toBe(false);
    expect(budgetCreateSchema.safeParse({ year: 2026, month: 8, income: "10000000000000000.00", envelopes: [] }).success).toBe(false);
  });
  it("requires paired month filters and explicit account confirmation", () => {
    expect(transactionQuerySchema.safeParse({ year: "2026" }).success).toBe(false);
    expect(transactionQuerySchema.safeParse({ year: "2026", month: "8" }).success).toBe(true);
    expect(accountDeleteSchema.safeParse({ password: "secret", confirmation: "delete" }).success).toBe(false);
  });
});
