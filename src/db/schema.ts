import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const envelopeType = pgEnum("envelope_type", ["expense", "savings"]);
export const transactionType = pgEnum("transaction_type", ["expense", "saving"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("users_email_unique").on(table.email)]);

export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("oauth_accounts_provider_subject_unique").on(table.provider, table.providerAccountId),
  uniqueIndex("oauth_accounts_provider_user_unique").on(table.provider, table.userId),
]);

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  currency: text("currency").default("INR").notNull(),
  locale: text("locale").default("en-IN").notNull(),
  timezone: text("timezone").default("Asia/Kolkata").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("profiles_user_unique").on(table.userId)]);

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").default("dark").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("settings_user_unique").on(table.userId)]);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("sessions_token_unique").on(table.tokenHash),
  index("sessions_user_idx").on(table.userId),
  index("sessions_expiry_idx").on(table.expiresAt),
]);

export const budgetMonths = pgTable("budget_months", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  income: numeric("income", { precision: 18, scale: 2 }).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("budget_user_month_unique").on(table.userId, table.year, table.month),
  index("budget_user_idx").on(table.userId),
]);

export const envelopes = pgTable("envelopes", {
  id: uuid("id").defaultRandom().primaryKey(),
  budgetMonthId: uuid("budget_month_id").notNull().references(() => budgetMonths.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").default("WalletCards").notNull(),
  accent: text("accent").default("amber").notNull(),
  type: envelopeType("type").default("expense").notNull(),
  allocatedAmount: numeric("allocated_amount", { precision: 18, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  ...timestamps,
}, (table) => [
  index("envelopes_user_idx").on(table.userId),
  index("envelopes_budget_idx").on(table.budgetMonthId),
  uniqueIndex("envelopes_budget_name_unique").on(table.budgetMonthId, table.name),
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  budgetMonthId: uuid("budget_month_id").notNull().references(() => budgetMonths.id, { onDelete: "cascade" }),
  envelopeId: uuid("envelope_id").notNull().references(() => envelopes.id, { onDelete: "restrict" }),
  type: transactionType("type").default("expense").notNull(),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
  note: text("note"),
  merchant: text("merchant"),
  ...timestamps,
}, (table) => [
  index("transactions_user_idx").on(table.userId),
  index("transactions_budget_idx").on(table.budgetMonthId),
  index("transactions_envelope_idx").on(table.envelopeId),
  index("transactions_date_idx").on(table.transactionDate),
]);

export type User = typeof users.$inferSelect;
export type BudgetMonth = typeof budgetMonths.$inferSelect;
export type Envelope = typeof envelopes.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
