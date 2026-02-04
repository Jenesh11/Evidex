import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// const AdmZip = require('adm-zip'); // Lazy load
import { executeQueryOne, executeUpdate } from '../../src/database/db.js';

const BACKUP_FOLDER_NAME = 'backups';

/**
 * Get the backup directory path
 */
export function getBackupDirectory() {
    const userDataPath = app.getPath('userData');
    const backupPath = path.join(userDataPath, 'InventoryAppData', BACKUP_FOLDER_NAME);

    // Ensure backup directory exists
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
    }

    return backupPath;
}

/**
 * Create a backup of the database
 */
export async function createBackup() {
    try {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'InventoryAppData', 'inventory.db');

        // Check if database exists
        if (!fs.existsSync(dbPath)) {
            throw new Error('Database file not found');
        }

        // Get backup directory
        const backupDir = getBackupDirectory();

        // Create backup filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' +
            new Date().toTimeString().split(' ')[0].replace(/:/g, '');
        const backupFileName = `backup-${timestamp}.zip`;
        const backupFilePath = path.join(backupDir, backupFileName);

        // Create ZIP archive
        // Create ZIP archive
        const AdmZip = require('adm-zip');
        const zip = new AdmZip();

        // Add database file
        zip.addLocalFile(dbPath);

        // Add metadata
        const metadata = {
            created_at: new Date().toISOString(),
            app_version: app.getVersion(),
            database_size: fs.statSync(dbPath).size
        };
        zip.addFile('backup-metadata.json', Buffer.from(JSON.stringify(metadata, null, 2)));

        // Write ZIP file
        zip.writeZip(backupFilePath);

        // Update last backup timestamp in settings
        await executeUpdate(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            ['last_backup_at', new Date().toISOString()]
        );

        return {
            success: true,
            filePath: backupFilePath,
            fileName: backupFileName,
            size: fs.statSync(backupFilePath).size
        };
    } catch (error) {
        console.error('Backup creation failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check if backup should run (last backup > 24 hours ago)
 */
export async function shouldRunBackup() {
    try {
        // Check if auto backup is enabled
        const enabled = executeQueryOne('SELECT value FROM settings WHERE key = ?', ['backup_enabled']);
        if (!enabled || enabled.value !== 'true') {
            return false;
        }

        // Get last backup timestamp
        const lastBackup = executeQueryOne('SELECT value FROM settings WHERE key = ?', ['last_backup_at']);

        if (!lastBackup || !lastBackup.value) {
            return true; // Never backed up
        }

        const lastBackupTime = new Date(lastBackup.value);
        const now = new Date();
        const hoursSinceBackup = (now - lastBackupTime) / (1000 * 60 * 60);

        return hoursSinceBackup >= 24;
    } catch (error) {
        console.error('Error checking backup status:', error);
        return false;
    }
}

/**
 * Clean old backups based on retention policy
 */
export async function cleanOldBackups() {
    try {
        // Get retention days from settings (default: 7)
        const retentionSetting = executeQueryOne('SELECT value FROM settings WHERE key = ?', ['backup_retention_days']);
        const retentionDays = retentionSetting ? parseInt(retentionSetting.value) : 7;

        const backupDir = getBackupDirectory();
        const files = fs.readdirSync(backupDir);

        const now = Date.now();
        const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

        let deletedCount = 0;

        files.forEach(file => {
            if (file.startsWith('backup-') && file.endsWith('.zip')) {
                const filePath = path.join(backupDir, file);
                const stats = fs.statSync(filePath);
                const age = now - stats.mtimeMs;

                if (age > retentionMs) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                }
            }
        });

        return { success: true, deletedCount };
    } catch (error) {
        console.error('Error cleaning old backups:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get backup statistics
 */
export function getBackupStats() {
    try {
        const backupDir = getBackupDirectory();
        const files = fs.readdirSync(backupDir).filter(f => f.startsWith('backup-') && f.endsWith('.zip'));

        let totalSize = 0;
        let latestBackup = null;

        files.forEach(file => {
            const filePath = path.join(backupDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;

            if (!latestBackup || stats.mtime > latestBackup.mtime) {
                latestBackup = {
                    fileName: file,
                    mtime: stats.mtime,
                    size: stats.size
                };
            }
        });

        return {
            success: true,
            backupCount: files.length,
            totalSize,
            latestBackup: latestBackup ? {
                fileName: latestBackup.fileName,
                createdAt: latestBackup.mtime.toISOString(),
                size: latestBackup.size
            } : null,
            backupDirectory: backupDir
        };
    } catch (error) {
        console.error('Error getting backup stats:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
