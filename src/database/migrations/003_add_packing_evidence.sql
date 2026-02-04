-- Migration: Add packing evidence table for checklist and photos
-- This table stores packing checklist completion status and photo references

CREATE TABLE IF NOT EXISTS packing_evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    video_id INTEGER,
    checklist_product_correct BOOLEAN DEFAULT 0,
    checklist_quantity_correct BOOLEAN DEFAULT 0,
    checklist_sealing_done BOOLEAN DEFAULT 0,
    photo_before_seal TEXT,
    photo_after_seal TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (video_id) REFERENCES videos(id)
);

CREATE INDEX IF NOT EXISTS idx_packing_evidence_order ON packing_evidence(order_id);
CREATE INDEX IF NOT EXISTS idx_packing_evidence_video ON packing_evidence(video_id);
