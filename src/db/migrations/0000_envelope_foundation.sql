CREATE EXTENSION IF NOT EXISTS "pgcrypto";
DO $$ BEGIN
 CREATE TYPE "public"."envelope_type" AS ENUM('expense', 'savings');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
 CREATE TYPE "public"."transaction_type" AS ENUM('expense', 'saving');
EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL, "password_hash" text NOT NULL,
  "email_verified_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");
CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "display_name" text NOT NULL, "avatar_url" text,
  "currency" text DEFAULT 'INR' NOT NULL, "locale" text DEFAULT 'en-IN' NOT NULL,
  "timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_unique" ON "user_profiles" ("user_id");
CREATE TABLE IF NOT EXISTS "user_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "theme" text DEFAULT 'dark' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "settings_user_unique" ON "user_settings" ("user_id");
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL, "expires_at" timestamp with time zone NOT NULL,
  "user_agent" text, "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_unique" ON "sessions" ("token_hash");
CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_expiry_idx" ON "sessions" ("expires_at");
CREATE TABLE IF NOT EXISTS "budget_months" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "year" integer NOT NULL, "month" integer NOT NULL,
  "income" numeric(18,2) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "budget_user_month_unique" ON "budget_months" ("user_id", "year", "month");
CREATE INDEX IF NOT EXISTS "budget_user_idx" ON "budget_months" ("user_id");
CREATE TABLE IF NOT EXISTS "envelopes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "budget_month_id" uuid NOT NULL REFERENCES "budget_months"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL, "icon" text DEFAULT 'WalletCards' NOT NULL,
  "accent" text DEFAULT 'amber' NOT NULL, "type" "envelope_type" DEFAULT 'expense' NOT NULL,
  "allocated_amount" numeric(18,2) NOT NULL, "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "envelopes_user_idx" ON "envelopes" ("user_id");
CREATE INDEX IF NOT EXISTS "envelopes_budget_idx" ON "envelopes" ("budget_month_id");
CREATE UNIQUE INDEX IF NOT EXISTS "envelopes_budget_name_unique" ON "envelopes" ("budget_month_id", "name");
CREATE TABLE IF NOT EXISTS "transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "budget_month_id" uuid NOT NULL REFERENCES "budget_months"("id") ON DELETE CASCADE,
  "envelope_id" uuid NOT NULL REFERENCES "envelopes"("id") ON DELETE RESTRICT,
  "type" "transaction_type" DEFAULT 'expense' NOT NULL, "title" text NOT NULL,
  "amount" numeric(18,2) NOT NULL, "transaction_date" timestamp with time zone NOT NULL,
  "note" text, "merchant" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "transactions_user_idx" ON "transactions" ("user_id");
CREATE INDEX IF NOT EXISTS "transactions_budget_idx" ON "transactions" ("budget_month_id");
CREATE INDEX IF NOT EXISTS "transactions_envelope_idx" ON "transactions" ("envelope_id");
CREATE INDEX IF NOT EXISTS "transactions_date_idx" ON "transactions" ("transaction_date");
