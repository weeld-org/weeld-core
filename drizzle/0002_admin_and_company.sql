-- Add company number to tenants
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS company_number text NOT NULL;

DO $$ BEGIN
  CREATE UNIQUE INDEX tenants_company_unique ON tenants(company_number);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Add SaaS admin flag on users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS saas_admin boolean NOT NULL DEFAULT false;

