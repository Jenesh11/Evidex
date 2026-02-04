import { ipcMain } from 'electron';
import checkDiskSpace from 'check-disk-space';
import { app } from 'electron';

export const setupSystemHandlers = () => {
    // Get disk usage
    ipcMain.handle('system:getDiskUsage', async () => {
        try {
            // Get the path where userdata is stored to check that drive
            const userDataPath = app.getPath('userData');
            // On Windows, extracting the drive letter (e.g., "C:")
            const drive = userDataPath.substring(0, 2);

            const space = await checkDiskSpace(drive);

            return {
                free: space.free,
                size: space.size,
                used: space.size - space.free,
                percentUsed: ((space.size - space.free) / space.size) * 100
            };
        } catch (error) {
            console.error('Error checking disk space:', error);
            // Return fallback values if check fails
            return {
                free: 0,
                size: 0,
                used: 0,
                percentUsed: 0
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
