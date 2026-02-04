-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    onboarding_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default legacy workspace for existing data
INSERT OR IGNORE INTO workspaces (id, owner_id, name, onboarding_completed)
VALUES ('legacy_workspace', 'local_user', 'My Workspace', 1);

-- Add workspace_id to products
ALTER TABLE products ADD COLUMN workspace_id TEXT;
UPDATE products SET workspace_id = 'legacy_workspace' WHERE workspace_id IS NULL;

-- Add workspace_id to orders
ALTER TABLE orders ADD COLUMN workspace_id TEXT;
UPDATE orders SET workspace_id = 'legacy_workspace' WHERE workspace_id IS NULL;

-- Add workspace_id to order_items
ALTER TABLE order_items ADD COLUMN workspace_id TEXT;
UPDATE order_items SET workspace_id = 'legacy_workspace' WHERE workspace_id IS NULL;

-- Add workspace_id to returns
ALTER TABLE returns ADD COLUMN workspace_id TEXT;
UPDATE returns SET workspace_id = 'legacy_workspace' WHERE workspace_id IS NULL;

-- Add workspace_id to packing_evidence
ALTER TABLE packing_evidence ADD COLUMN workspace_id TEXT;
UPDATE packing_evidence SET workspace_id = 'legacy_workspace' WHERE workspace_id IS NULL;

-- Add workspace_id to audit_logs
ALTER TABLE audit_logs ADD COLUMN workspace_id TEXT;
UPDATE audit_logs SET workspace_id = 'legacy_workspace' WHERE workspace_id IS NULL;

-- Add workspace_id to settings
ALTER TABLE settings ADD COLUMN workspace_id TEXT;
UPDATE settings SET workspace_id = 'legacy_workspace' WHERE workspace_id IS NULL;

-- Add workspace_id to inventory_movements if it exists (from 002 migration)
-- Note: SQLite doesn't support IF EXISTS in ALTER TABLE nicely, so we assume it exists based on previous migrations
ALTER TABLE inventory_movements ADD COLUMN workspace_id TEXT;
UPDATE inventory_movements SET workspace_id = 'legacy_workspace' WHERE workspace_id IS NULL;
