import { describe, expect, it } from "vitest";
import { budgetCreateSchema, transactionInputSchema } from "./validation";

describe("validation", () => {
  it("rejects negative income", () => expect(budgetCreateSchema.safeParse({ year: 2026, month: 8, income: "-1" }).success).toBe(false));
  it("rejects zero expenses and invalid IDs", () => expect(transactionInputSchema.safeParse({ budgetMonthId: "x", envelopeId: "x", title: "Food", amount: "0", transactionDate: new Date() }).success).toBe(false));
  it("accepts precise money", () => expect(budgetCreateSchema.safeParse({ year: 2026, month: 8, income: "999999999.99", envelopes: [] }).success).toBe(true));
});
