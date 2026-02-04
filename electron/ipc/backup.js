import { ipcMain } from 'electron';
import { createBackup, getBackupStats, cleanOldBackups } from '../services/backupService.js';
import { executeQueryOne, executeUpdate } from '../../src/database/db.js';

export const setupBackupHandlers = () => {
    // Create backup manually
    ipcMain.handle('backup:create', async () => {
        const result = await createBackup();

        // Clean old backups after creating new one
        if (result.success) {
            await cleanOldBackups();
        }

        return result;
    });

    // Get backup statistics
    ipcMain.handle('backup:getStats', () => {
        return getBackupStats();
    });

    // Get backup settings
    ipcMain.handle('backup:getSettings', () => {
        try {
            const enabled = executeQueryOne('SELECT value FROM settings WHERE key = ?', ['backup_enabled']);
            const location = executeQueryOne('SELECT value FROM settings WHERE key = ?', ['backup_location']);
            const lastBackup = executeQueryOne('SELECT value FROM settings WHERE key = ?', ['last_backup_at']);
            const retention = executeQueryOne('SELECT value FROM settings WHERE key = ?', ['backup_retention_days']);

            return {
                success: true,
                settings: {
                    enabled: enabled?.value === 'true',
                    location: location?.value || 'default',
                    lastBackupAt: lastBackup?.value || null,
                    retentionDays: retention ? parseInt(retention.value) : 7
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    });

    // Update backup settings
    ipcMain.handle('backup:updateSettings', async (event, settings) => {
        try {
            if (settings.enabled !== undefined) {
                await executeUpdate(
                    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                    ['backup_enabled', settings.enabled ? 'true' : 'false']
                );
            }

            if (settings.location) {
                await executeUpdate(
                    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                    ['backup_location', settings.location]
                );
            }

            if (settings.retentionDays !== undefined) {
                await executeUpdate(
                    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                    ['backup_retention_days', settings.retentionDays.toString()]
                );
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    });
};
