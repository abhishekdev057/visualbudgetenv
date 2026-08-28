import { z } from "zod";
import { money } from "./finance";

const MAX_MONEY = "9999999999999999.99";
const decimal = z.union([z.string(), z.number()]).transform(String)
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), "Enter a valid amount with up to 2 decimals")
  .refine((value) => money(value).lte(MAX_MONEY), "Amount is too large");
export const nonNegativeMoney = decimal.refine((value) => money(value).gte(0), "Amount cannot be negative");
export const positiveMoney = decimal.refine((value) => money(value).gt(0), "Amount must be greater than zero");
export const uuid = z.string().uuid();
export const monthQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2200),
  month: z.coerce.number().int().min(1).max(12),
});

export const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(128).regex(/[A-Z]/, "Include an uppercase letter").regex(/[a-z]/, "Include a lowercase letter").regex(/\d/, "Include a number"),
  client: z.enum(["web", "mobile"]).default("web"),
});
export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
  client: z.enum(["web", "mobile"]).default("web"),
});
export const envelopeInputSchema = z.object({
  name: z.string().trim().min(1).max(60), icon: z.string().min(1).max(40).default("WalletCards"),
  accent: z.enum(["amber", "violet", "cyan", "rose", "emerald", "blue"]).default("amber"),
  type: z.enum(["expense", "savings"]).default("expense"), allocatedAmount: nonNegativeMoney,
});
export const budgetCreateSchema = z.object({
  year: z.number().int().min(2000).max(2200), month: z.number().int().min(1).max(12),
  income: nonNegativeMoney, envelopes: z.array(envelopeInputSchema).max(50).default([]),
});
export const budgetUpdateSchema = z.object({ income: nonNegativeMoney });
export const transactionInputSchema = z.object({
  budgetMonthId: uuid, envelopeId: uuid, title: z.string().trim().min(1).max(120), amount: positiveMoney,
  transactionDate: z.coerce.date(), note: z.string().trim().max(500).nullable().optional(), merchant: z.string().trim().max(120).nullable().optional(),
});
export const transactionUpdateSchema = transactionInputSchema.partial().refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");
export const transactionQuerySchema = z.object({
  budgetId: uuid.optional(), envelopeId: uuid.optional(), search: z.string().trim().max(120).optional(),
  from: z.coerce.date().optional(), to: z.coerce.date().optional(), limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().max(500).optional(), sort: z.enum(["newest", "oldest", "highest", "lowest"]).optional(),
  year: z.coerce.number().int().min(2000).max(2200).optional(), month: z.coerce.number().int().min(1).max(12).optional(),
}).refine((value) => (value.year === undefined) === (value.month === undefined), "Year and month must be provided together");
export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(80).optional(), avatarUrl: z.string().url().nullable().optional(),
  currency: z.enum(["INR"]).optional(), locale: z.enum(["en-IN"]).optional(), timezone: z.string().min(1).max(80).optional(),
});
export const settingsUpdateSchema = z.object({ theme: z.enum(["dark", "light", "system"]) });
export const accountDeleteSchema = z.object({ password: z.string().min(1).max(128).optional(), confirmation: z.literal("DELETE") });
export const envelopeUpdateSchema = envelopeInputSchema.partial().refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");
