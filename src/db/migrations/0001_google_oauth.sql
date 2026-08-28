ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "oauth_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "oauth_accounts_provider_subject_unique"
  ON "oauth_accounts" ("provider", "provider_account_id");
CREATE UNIQUE INDEX IF NOT EXISTS "oauth_accounts_provider_user_unique"
  ON "oauth_accounts" ("provider", "user_id");
