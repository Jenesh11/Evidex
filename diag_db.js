import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'inventory-order-management', 'InventoryAppData', 'inventory.db');

try {
    const db = new Database(dbPath);
    console.log('--- Triggers ---');
    const triggers = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='trigger'").all();
    console.log(JSON.stringify(triggers, null, 2));

    console.log('--- Migrations ---');
    const migrations = db.prepare("SELECT filename FROM migrations").all();
    console.log(JSON.stringify(migrations, null, 2));

    db.close();
} catch (error) {
    console.error('Diagnostic error:', error);
}
