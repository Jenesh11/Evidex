import { executeQuery, executeQueryOne, executeUpdate, getDatabase } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = () => {
    try {
        const db = getDatabase();

        // Create migrations table if not exists
        db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        const migrationsDir = path.join(__dirname, 'migrations');

        if (!fs.existsSync(migrationsDir)) {
            fs.mkdirSync(migrationsDir, { recursive: true });
        }

        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        migrationFiles.forEach(filename => {
            const executed = executeQueryOne(
                'SELECT * FROM migrations WHERE filename = ?',
                [filename]
            );

            if (!executed) {
                console.log(`Running migration: ${filename}`);
                const migrationPath = path.join(migrationsDir, filename);
                const sql = fs.readFileSync(migrationPath, 'utf-8');

                // Split by semicolon and execute each statement
                const statements = sql.split(';').filter(s => s.trim());
                statements.forEach(statement => {
                    if (statement.trim()) {
                        try {
                            db.exec(statement);
                        } catch (error) {
                            // Ignore errors for ALTER TABLE ADD COLUMN if column exists
                            if (!error.message.includes('duplicate column name')) {
                                throw error;
                            }
                        }
                    }
                });

                executeUpdate(
                    'INSERT INTO migrations (filename) VALUES (?)',
                    [filename]
                );
                console.log(`Migration completed: ${filename}`);
            }
        });

        console.log('All migrations completed');
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
};
