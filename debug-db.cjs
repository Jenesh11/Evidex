const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'inventory.db');
const db = new Database(dbPath);

console.log('\n=== ORDER_ITEMS TABLE SCHEMA ===');
const schema = db.prepare('PRAGMA table_info(order_items)').all();
console.table(schema);

console.log('\n=== ORDER_ITEMS DATA (with flags) ===');
try {
    const items = db.prepare('SELECT id, order_id, product_id, quantity, stock_deducted, stock_returned FROM order_items').all();
    console.table(items);
} catch (e) {
    console.error('Error querying order_items:', e.message);
}

console.log('\n=== STOCK MOVEMENTS (RETURN_RESTOCK) ===');
const movements = db.prepare(`
  SELECT * FROM stock_movements 
  WHERE movement_type = 'RETURN_RESTOCK' 
  ORDER BY created_at DESC 
  LIMIT 10
`).all();
console.table(movements);

db.close();
