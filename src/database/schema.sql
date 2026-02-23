-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    image_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    status TEXT DEFAULT 'NEW',
    total_amount REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    packed_by INTEGER,
    packed_at DATETIME,
    FOREIGN KEY (packed_by) REFERENCES staff(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Videos Table
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT 1,
    duration INTEGER,
    file_size INTEGER,
    recorded_by INTEGER NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (recorded_by) REFERENCES staff(id)
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'PACKER',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    movement_type TEXT NOT NULL,
    reason TEXT,
    reference_id INTEGER,
    staff_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Returns Table
CREATE TABLE IF NOT EXISTS returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    return_type TEXT DEFAULT 'RETURN',
    reason TEXT,
    inspection_notes TEXT,
    inspection_checklist TEXT,
    images TEXT,
    status TEXT DEFAULT 'PENDING',
    inspected_by INTEGER,
    inspected_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (inspected_by) REFERENCES staff(id)
);

-- Audit Logs Table (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_order_id ON videos(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_staff_id ON audit_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Trigger: Update product updated_at
CREATE TRIGGER IF NOT EXISTS update_product_timestamp 
AFTER UPDATE ON products
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Update order updated_at
CREATE TRIGGER IF NOT EXISTS update_order_timestamp 
AFTER UPDATE ON orders
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Log product changes
CREATE TRIGGER IF NOT EXISTS log_product_insert
AFTER INSERT ON products
BEGIN
    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES ('CREATE', 'PRODUCT', NEW.id, json_object('sku', NEW.sku, 'name', NEW.name));
END;

CREATE TRIGGER IF NOT EXISTS log_product_update
AFTER UPDATE ON products
BEGIN
    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES ('UPDATE', 'PRODUCT', NEW.id, json_object('sku', NEW.sku, 'name', NEW.name));
END;

CREATE TRIGGER IF NOT EXISTS log_product_delete
AFTER DELETE ON products
BEGIN
    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES ('DELETE', 'PRODUCT', OLD.id, json_object('sku', OLD.sku, 'name', OLD.name));
END;

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO staff (id, username, password_hash, full_name, role, is_active)
VALUES (1, 'admin', '$2a$10$rKZLvXZvXZvXZvXZvXZvXeYxYxYxYxYxYxYxYxYxYxYxYxYxYxY', 'System Admin', 'ADMIN', 1);

-- Inventory Movements Table (Ledger-based tracking for reconciliation)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('IN', 'OUT')),
    reason TEXT NOT NULL,
    notes TEXT,
    performed_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (performed_by) REFERENCES staff(id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_movements(created_at);
