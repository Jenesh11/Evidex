-- Create license_codes table (SQLite Version)
-- Cleanup stale PostgreSQL triggers if any exist in the local DB
DROP TRIGGER IF EXISTS handle_new_user;
DROP TRIGGER IF EXISTS on_auth_user_created;

CREATE TABLE IF NOT EXISTS license_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('STARTER', 'PRO')),
    duration_months INTEGER DEFAULT 1,
    is_used BOOLEAN DEFAULT 0,
    used_at TEXT,
    order_id TEXT UNIQUE, -- Cashfree Order ID
    customer_email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
