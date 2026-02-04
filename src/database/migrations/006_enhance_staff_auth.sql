-- Enhance staff table for offline auth
ALTER TABLE staff ADD COLUMN username TEXT;
ALTER TABLE staff ADD COLUMN password_hash TEXT;
ALTER TABLE staff ADD COLUMN permissions TEXT;
ALTER TABLE staff ADD COLUMN workspace_id TEXT;

-- Update existing staff with defaults if any (handle in code or here)
-- We set workspace_id to 'legacy_workspace' for existing records
UPDATE staff SET workspace_id = 'legacy_workspace' WHERE workspace_id IS NULL;

-- Create index for fast login lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
