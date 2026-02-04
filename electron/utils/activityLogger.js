import { executeUpdate } from '../../src/database/db.js';

/**
 * Log an activity to the audit_logs table
 * @param {number} userId - ID of the user performing the action
 * @param {string} action - Action type (e.g., 'ORDER_PACKED', 'VIDEO_RECORDED')
 * @param {string} entityType - Type of entity (e.g., 'order', 'video', 'return')
 * @param {number|null} entityId - ID of the entity
 * @param {object} metadata - Additional data to store as JSON
 */
export const logActivity = (userId, action, entityType, entityId = null, metadata = {}) => {
    try {
        executeUpdate(
            `INSERT INTO audit_logs (staff_id, action, entity_type, entity_id, details)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, action, entityType, entityId, JSON.stringify(metadata)]
        );
        console.log(`[Activity] ${action} by user ${userId} on ${entityType} ${entityId || ''}`);
    } catch (error) {
        console.error('[Activity] Logging error:', error);
        // Don't throw - logging failure shouldn't break main operation
    }
};
