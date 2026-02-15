import { ipcMain } from 'electron';
import { executeQuery, executeQueryOne, executeUpdate } from '../../src/database/db.js';
import { getVideoStorageRoot } from './files.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Generate SHA-256 hash for a file
const generateFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
};

// Make file read-only
const lockFile = (filePath) => {
    try {
        fs.chmodSync(filePath, 0o444); // Read-only for all
    } catch (error) {
        console.error('Error locking file:', error);
    }
};

export const setupVideoHandlers = () => {
    // Save video with hash
    ipcMain.handle('video:save', async (event, videoData) => {
        try {
            const { orderNumber, buffer, recordedBy, duration } = videoData;

            // Get configured video storage root (default or custom)
            const videoRoot = getVideoStorageRoot();

            // Create date-based folder
            const today = new Date().toISOString().split('T')[0];
            const videoDir = path.join(videoRoot, today);

            if (!fs.existsSync(videoDir)) {
                fs.mkdirSync(videoDir, { recursive: true });
            }

            // Generate filename
            const timestamp = Date.now();
            const filename = `${orderNumber}_${timestamp}.mp4`;
            const filePath = path.join(videoDir, filename);

            // Save video file
            const fileBuffer = Buffer.from(buffer);
            fs.writeFileSync(filePath, fileBuffer);

            // Generate hash
            const fileHash = await generateFileHash(filePath);

            // Lock file (read-only)
            lockFile(filePath);

            // Get file size
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;

            // Get order ID
            const order = executeQueryOne('SELECT id FROM orders WHERE order_number = ?', [orderNumber]);

            if (!order) {
                throw new Error('Order not found');
            }

            // Validate/Fix recordedBy (Foreign Key Constraint)
            // If recordedBy is a UUID (Supabase) or missing, fallback to local System Admin (ID: 1)
            let staffId = 1; // Default to Admin

            if (recordedBy) {
                const parsedId = parseInt(recordedBy);
                if (!isNaN(parsedId) && parsedId > 0) {
                    // Check if staff exists
                    const staff = executeQueryOne('SELECT id FROM staff WHERE id = ?', [parsedId]);
                    if (staff) {
                        staffId = parsedId;
                    }
                }
            }

            // Save to database
            const result = executeUpdate(
                `INSERT INTO videos (order_id, file_path, file_hash, duration, file_size, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [order.id, filePath, fileHash, duration, fileSize, staffId]
            );

            return {
                id: result.lastInsertRowid,
                filePath,
                fileHash,
                fileSize,
            };
        } catch (error) {
            console.error('Error saving video:', error);
            throw error;
        }
    });

    // Get video by order ID
    ipcMain.handle('video:getByOrderId', async (event, orderId) => {
        return executeQuery('SELECT * FROM videos WHERE order_id = ? ORDER BY recorded_at DESC', [orderId]);
    });

    // Verify video integrity
    ipcMain.handle('video:verify', async (event, videoId) => {
        try {
            const video = executeQueryOne('SELECT * FROM videos WHERE id = ?', [videoId]);

            if (!video) {
                throw new Error('Video not found');
            }

            // Check if file exists
            if (!fs.existsSync(video.file_path)) {
                executeUpdate('UPDATE videos SET is_valid = 0 WHERE id = ?', [videoId]);
                return { valid: false, reason: 'File not found' };
            }

            // Calculate current hash
            const currentHash = await generateFileHash(video.file_path);

            // Compare hashes
            const isValid = currentHash === video.file_hash;

            // Update database if invalid
            if (!isValid) {
                executeUpdate('UPDATE videos SET is_valid = 0 WHERE id = ?', [videoId]);
            }

            return {
                valid: isValid,
                originalHash: video.file_hash,
                currentHash,
                reason: isValid ? 'Valid' : 'Hash mismatch - file has been modified',
            };
        } catch (error) {
            console.error('Error verifying video:', error);
            throw error;
        }
    });

    // Get video file path
    ipcMain.handle('video:getPath', async (event, videoId) => {
        const video = executeQueryOne('SELECT file_path FROM videos WHERE id = ?', [videoId]);
        return video ? video.file_path : null;
    });
};
