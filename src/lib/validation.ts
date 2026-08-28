import { z } from "zod";

const decimal = z.union([z.string(), z.number()]).transform(String).refine((value) => /^\d+(\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value)), "Enter a valid amount with up to 2 decimals");
export const nonNegativeMoney = decimal.refine((value) => Number(value) >= 0, "Amount cannot be negative");
export const positiveMoney = decimal.refine((value) => Number(value) > 0, "Amount must be greater than zero");
export const uuid = z.string().uuid();

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
export const budgetUpdateSchema = z.object({ income: nonNegativeMoney }).partial();
export const transactionInputSchema = z.object({
  budgetMonthId: uuid, envelopeId: uuid, title: z.string().trim().min(1).max(120), amount: positiveMoney,
  transactionDate: z.coerce.date(), note: z.string().trim().max(500).nullable().optional(), merchant: z.string().trim().max(120).nullable().optional(),
});
export const transactionUpdateSchema = transactionInputSchema.partial();
export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(80).optional(), avatarUrl: z.string().url().nullable().optional(),
  currency: z.enum(["INR"]).optional(), locale: z.enum(["en-IN"]).optional(), timezone: z.string().min(1).max(80).optional(),
});
export const settingsUpdateSchema = z.object({ theme: z.enum(["dark", "light", "system"]) });
