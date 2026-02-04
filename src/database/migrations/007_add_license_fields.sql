-- Add license fields to workspaces table
ALTER TABLE workspaces ADD COLUMN license_key TEXT;
ALTER TABLE workspaces ADD COLUMN license_type TEXT DEFAULT 'STARTER'; -- STARTER, PRO_MONTHLY, PRO_6MONTHS, PRO_LIFETIME
ALTER TABLE workspaces ADD COLUMN license_expiry DATETIME;
