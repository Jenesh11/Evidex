import { ipcMain } from 'electron';
import { getDataPath } from '../../src/database/db.js';
import fs from 'fs';
import path from 'path';

export const setupPhotoHandlers = () => {
    // Save photo to disk
    ipcMain.handle('photos:save', async (event, photoData) => {
        try {
            const { orderNumber, buffer, type } = photoData;
            const dataPath = getDataPath();

            // Create date-based folder
            const today = new Date().toISOString().split('T')[0];
            const photoDir = path.join(dataPath, 'photos', today);

            if (!fs.existsSync(photoDir)) {
                fs.mkdirSync(photoDir, { recursive: true });
            }

            // Generate filename
            const timestamp = Date.now();
            const filename = `${orderNumber}_${timestamp}_${type}.jpg`;
            const filePath = path.join(photoDir, filename);

            // Save photo file
            const photoBuffer = Buffer.from(buffer);
            fs.writeFileSync(filePath, photoBuffer);

            console.log('[Photos] Saved photo:', filePath);

            return {
                filePath,
                filename,
            };
        } catch (error) {
            console.error('[Photos] Error saving photo:', error);
            throw error;
        }
    });

    // Get photos by order ID
    ipcMain.handle('photos:getByOrderId', async (event, orderId) => {
        try {
            // This will be handled by packing_evidence table
            // Just a placeholder for future direct photo queries
            return [];
        } catch (error) {
            console.error('[Photos] Error getting photos:', error);
            throw error;
        }
    });

    // Delete photo
    ipcMain.handle('photos:delete', async (event, filePath) => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('[Photos] Deleted photo:', filePath);
                return { success: true };
            }
            return { success: false, error: 'File not found' };
        } catch (error) {
            console.error('[Photos] Error deleting photo:', error);
            throw error;
        }
    });
};
