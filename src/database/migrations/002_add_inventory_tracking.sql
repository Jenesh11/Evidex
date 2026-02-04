-- Add inventory tracking columns to order_items
ALTER TABLE order_items ADD COLUMN stock_deducted BOOLEAN DEFAULT 0;
ALTER TABLE order_items ADD COLUMN stock_returned BOOLEAN DEFAULT 0;

-- Add stock tracking columns to returns
ALTER TABLE returns ADD COLUMN stock_restored BOOLEAN DEFAULT 0;
