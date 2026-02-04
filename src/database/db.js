import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

// Get user data directory
const getDataPath = () => {
    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, 'InventoryAppData');

    // Create directories if they don't exist
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create subdirectories
    const subdirs = ['videos', 'images', 'backups', 'logs'];
    subdirs.forEach(dir => {
        const dirPath = path.join(dataDir, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });

    return dataDir;
};

// Initialize database
export const initDatabase = () => {
    try {
        const dataPath = getDataPath();
        const dbPath = path.join(dataPath, 'inventory.db');

        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        db.exec(schema);

        // Run migrations
        import('./migrations.js').then(({ runMigrations }) => {
            runMigrations();
        }).catch(err => console.error('Migration error:', err));

        console.log('Database initialized successfully');
        return db;
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
};

// Get database instance
export const getDatabase = () => {
    if (!db) {
        initDatabase();
    }
    return db;
};

// Close database
export const closeDatabase = () => {
    if (db) {
        db.close();
        db = null;
    }
};

// Backup database
export const backupDatabase = () => {
    try {
        const dataPath = getDataPath();
        const dbPath = path.join(dataPath, 'inventory.db');
        const backupDir = path.join(dataPath, 'backups');
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupPath = path.join(backupDir, `inventory_${timestamp}.db`);

        fs.copyFileSync(dbPath, backupPath);

        console.log('Database backed up to:', backupPath);
        return backupPath;
    } catch (error) {
        console.error('Backup error:', error);
        throw error;
    }
};

// Execute query with error handling
export const executeQuery = (query, params = []) => {
    try {
        const database = getDatabase();
        const stmt = database.prepare(query);
        return stmt.all(params);
    } catch (error) {
        console.error('Query execution error:', error);
        throw error;
    }
};

// Execute single row query
export const executeQueryOne = (query, params = []) => {
    try {
        const database = getDatabase();
        const stmt = database.prepare(query);
        return stmt.get(params);
    } catch (error) {
        console.error('Query execution error:', error);
        throw error;
    }
};

// Execute insert/update/delete
export const executeUpdate = (query, params = []) => {
    try {
        const database = getDatabase();
        const stmt = database.prepare(query);
        return stmt.run(params);
    } catch (error) {
        console.error('Update execution error:', error);
        throw error;
    }
};

// Transaction helper
export const transaction = (callback) => {
    const database = getDatabase();
    const trans = database.transaction(callback);
    return trans();
};

// Export database instance for direct access (e.g., PRAGMA commands)
export const getDb = () => getDatabase();

export { getDataPath };
