import { ipcMain, dialog } from 'electron';
import { executeQueryOne, getDataPath } from '../../src/database/db.js';
import path from 'path';
import fs from 'fs';

// Helper to get configured storage path
export const getStoragePath = () => {
    try {
        const setting = executeQueryOne('SELECT value FROM settings WHERE key = ?', ['storage_location']);
        if (setting && setting.value && setting.value !== 'default') {
            return setting.value;
        }
    } catch (error) {
        console.error('Error reading storage setting:', error);
    }
    // Default: use the standard data path + /videos logic? 
    // Wait, if it's default, video.js appends /videos. 
    // If it's custom, we treat it as the root for videos.
    // So here we should just return NULL if default, or handle consistently.
    // Let's return NULL if default, and let the caller handle defaults.
    return null;
};

// Helper to get the effective video root directory
export const getVideoStorageRoot = () => {
    const customPath = getStoragePath();
    if (customPath) {
        return customPath;
    }
    return path.join(getDataPath(), 'videos');
};

export const setupFileHandlers = () => {
    // Select directory
    ipcMain.handle('files:selectDirectory', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory']
        });
        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
        return null;
    });

    // Select file (generic)
    ipcMain.handle('files:selectFile', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        });
        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
        return null;
    });

    // Get default data path
    ipcMain.handle('files:getDataPath', () => {
        return getDataPath();
    });
};
