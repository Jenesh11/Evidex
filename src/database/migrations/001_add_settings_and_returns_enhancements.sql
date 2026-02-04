-- Settings Table for app configuration
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('camera_device_id', 'default');
INSERT OR IGNORE INTO settings (key, value) VALUES ('camera_resolution', '1280x720');
INSERT OR IGNORE INTO settings (key, value) VALUES ('camera_framerate', '30');
INSERT OR IGNORE INTO settings (key, value) VALUES ('storage_location', 'default');

-- Add return_reason column to returns table if not exists
ALTER TABLE returns ADD COLUMN return_reason TEXT;

-- Add restock_status column to returns table if not exists  
ALTER TABLE returns ADD COLUMN restock_status TEXT DEFAULT 'PENDING';

-- Add inventory_adjusted column to returns table if not exists
ALTER TABLE returns ADD COLUMN inventory_adjusted BOOLEAN DEFAULT 0;
