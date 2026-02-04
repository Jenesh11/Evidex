import { ipcMain } from 'electron';
import { executeQuery, executeQueryOne, executeUpdate } from '../../src/database/db.js';

export const setupSettingsHandlers = () => {
    // Get setting
    ipcMain.handle('settings:get', async (event, key) => {
        const setting = executeQueryOne('SELECT value FROM settings WHERE key = ?', [key]);
        return setting ? setting.value : null;
    });

    // Set setting
    ipcMain.handle('settings:set', async (event, key, value) => {
        const existing = executeQueryOne('SELECT id FROM settings WHERE key = ?', [key]);

        if (existing) {
            return executeUpdate(
                'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
                [value, key]
            );
        } else {
            return executeUpdate(
                'INSERT INTO settings (key, value) VALUES (?, ?)',
                [key, value]
            );
        }
    });

    // Get all settings
    ipcMain.handle('settings:getAll', async () => {
        return executeQuery('SELECT * FROM settings');
    });
};
