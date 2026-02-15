import { ipcMain } from 'electron';
import checkDiskSpace from 'check-disk-space';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { getVideoStorageRoot } from './files.js';
import { getDataPath } from '../../src/database/db.js';

// Recursive function to get directory size
const getDirSize = (dirPath) => {
    let size = 0;
    try {
        if (!fs.existsSync(dirPath)) return 0;

        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                size += getDirSize(filePath);
            } else {
                size += stats.size;
            }
        }
    } catch (error) {
        console.error(`Error calculating size for ${dirPath}:`, error);
    }
    return size;
};

export const setupSystemHandlers = () => {
    // Get disk usage
    ipcMain.handle('system:getDiskUsage', async () => {
        try {
            // Get the path where userdata is stored to check that drive
            const userDataPath = app.getPath('userData');
            // On Windows, extracting the drive letter (e.g., "C:")
            const drive = userDataPath.substring(0, 2);

            const space = await checkDiskSpace(drive);

            // Calculate specific folder sizes
            const videoRoot = getVideoStorageRoot();
            const videosSize = getDirSize(videoRoot);

            const imagesPath = path.join(getDataPath(), 'images');
            const imagesSize = getDirSize(imagesPath);

            const dbPath = path.join(getDataPath(), 'inventory.db');
            let dbSize = 0;
            if (fs.existsSync(dbPath)) {
                dbSize = fs.statSync(dbPath).size;
            }

            return {
                free: space.free,
                size: space.size,
                used: space.size - space.free,
                percentUsed: ((space.size - space.free) / space.size) * 100,
                videos: videosSize,
                images: imagesSize,
                database: dbSize,
                total: videosSize + imagesSize + dbSize
            };
        } catch (error) {
            console.error('Error checking disk space:', error);
            // Return fallback values if check fails
            return {
                free: 0,
                size: 0,
                used: 0,
                percentUsed: 0,
                videos: 0,
                images: 0,
                database: 0,
                total: 0
            };
        }
    });

    // Run backup (moved from main or specific backup handler if needed, 
    // but typically backup handlers might be in their own file. 
    // If 'system:backup' was called, we should ensure it's handled here or in backup.js)

    // Note: backup.js handles 'system:backup' in previous context? 
    // Let's check where 'system:backup' was defined. 
    // It was likely in backup.js but exposed as system:backup.
};
