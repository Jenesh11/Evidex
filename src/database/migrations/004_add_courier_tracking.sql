-- Migration: Add courier tracking to orders
-- This enables courier-wise RTO analytics

ALTER TABLE orders ADD COLUMN courier_name TEXT;
