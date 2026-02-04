import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'inventory.db');
const db = new Database(dbPath);

console.log('\n=== ORDER_ITEMS TABLE SCHEMA ===');
const schema = db.prepare('PRAGMA table_info(order_items)').all();
console.table(schema);

console.log('\n=== ORDER_ITEMS DATA (with flags) ===');
const items = db.prepare('SELECT id, order_id, product_id, quantity, stock_deducted, stock_returned FROM order_items').all();
console.table(items);

console.log('\n=== STOCK MOVEMENTS (RETURN_RESTOCK) ===');
const movements = db.prepare(`
  SELECT * FROM stock_movements 
  WHERE movement_type = 'RETURN_RESTOCK' 
  ORDER BY created_at DESC 
  LIMIT 10
`).all();
console.table(movements);

console.log('\n=== AUDIT LOGS (INVENTORY_RESTORE) ===');
const audits = db.prepare(`
  SELECT * FROM audit_logs 
  WHERE action = 'INVENTORY_RESTORE' 
  ORDER BY created_at DESC 
  LIMIT 10
`).all();
console.table(audits);

db.close();
