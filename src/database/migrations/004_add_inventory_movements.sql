-- Create inventory_movements table for ledger-based inventory tracking
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
