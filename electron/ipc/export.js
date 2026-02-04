import { ipcMain } from 'electron';
import { executeQuery, executeQueryOne, getDataPath } from '../../src/database/db.js';
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

export const setupExportHandlers = () => {
    // Generate evidence export data
    ipcMain.handle('export:generateEvidence', async (event, orderId, returnId) => {
        try {
            console.log('[Export] Generating evidence for order:', orderId, 'return:', returnId);

            // Get order details
            const order = executeQueryOne(
                `SELECT o.*, GROUP_CONCAT(oi.product_id || ':' || oi.quantity) as items
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 WHERE o.id = ?
                 GROUP BY o.id`,
                [orderId]
            );

            if (!order) {
                throw new Error('Order not found');
            }

            // Get return details
            const returnData = executeQueryOne(
                'SELECT * FROM returns WHERE id = ?',
                [returnId]
            );

            if (!returnData) {
                throw new Error('Return record not found');
            }

            // Get video evidence
            const video = executeQueryOne(
                'SELECT * FROM videos WHERE order_id = ? ORDER BY recorded_at DESC LIMIT 1',
                [orderId]
            );

            if (!video) {
                throw new Error('Video evidence not found for this order');
            }

            // Verify video file exists
            if (!fs.existsSync(video.file_path)) {
                throw new Error('Video file is missing or inaccessible');
            }

            // Get staff who packed the order
            const staff = executeQueryOne(
                'SELECT username, full_name FROM staff WHERE id = ?',
                [video.recorded_by]
            );

            // Get product details
            const products = executeQuery(
                `SELECT p.name, p.sku, oi.quantity, oi.price
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            // Read video file
            console.log('[Export] Reading video file:', video.file_path);
            const videoBuffer = fs.readFileSync(video.file_path);

            // Compute hash from actual file
            console.log('[Export] Computing video hash...');
            const computedHash = await generateFileHash(video.file_path);

            // Get file stats
            const stats = fs.statSync(video.file_path);

            // Compile evidence data
            const evidenceData = {
                orderNumber: order.order_number,
                orderId: order.id,
                orderDate: order.created_at,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                products: products,
                returnType: returnData.type,
                returnReason: returnData.reason,
                returnStatus: returnData.status,
                returnInitiated: returnData.created_at,
                packedDate: video.recorded_at,
                packedBy: staff ? staff.full_name : 'Unknown',
                packedByUsername: staff ? staff.username : 'Unknown',
                videoDuration: video.duration,
                videoHash: computedHash,
                videoHashStored: video.file_hash,
                videoSize: stats.size,
                videoIntegrity: computedHash === video.file_hash ? 'VALID' : 'INVALID',
                videoBuffer: Array.from(videoBuffer),
                exportDate: new Date().toISOString(),
                appVersion: '1.0.0'
            };

            console.log('[Export] Evidence data compiled successfully');
            return evidenceData;

        } catch (error) {
            console.error('[Export] Error generating evidence:', error);
            throw error;
        }
    });
};
