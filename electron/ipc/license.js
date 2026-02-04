import { ipcMain } from 'electron';
import { executeQuery, executeQueryOne, executeUpdate } from '../../src/database/db.js';

let currentWorkspaceId = null;

export const setLicenseWorkspaceId = (id) => {
    currentWorkspaceId = id;
};

// Simple pattern-based validation for MVP Offline
// Format: EVIDEX-{TYPE}-{RANDOM}
// Types: 1M (1 Month), 6M (6 Months), 12M (12 Months), LIFE (Lifetime)
const validateLicenseCode = (code) => {
    const parts = code.toUpperCase().split('-');
    if (parts.length !== 3 || parts[0] !== 'EVIDEX') {
        return null;
    }

    // parts[1] is the TYPE code
    const typeCode = parts[1];
    let planType = null;
    let durationDays = 0;
    let isLifetime = false;

    switch (typeCode) {
        case '1M':
        case 'PRO_MONTHLY':
            planType = 'PRO';
            durationDays = 30;
            break;
        case '6M':
        case 'PRO_6MONTHS':
            planType = 'PRO';
            durationDays = 180;
            break;
        case '12M':
        case 'PRO_YEARLY':
        case 'PRO_12MONTHS':
            planType = 'PRO';
            durationDays = 365;
            break;
        case 'LIFE':
        case 'PRO_LIFETIME':
            planType = 'PRO';
            durationDays = 365 * 100; // 100 Years
            isLifetime = true;
            break;
        default:
            return null;
    }

    return { planType, durationDays, isLifetime };
};

export const setupLicenseHandlers = () => {

    // Claim License
    ipcMain.handle('license:claim', async (event, code_data) => {
        // code_data can be string (legacy) or object { code, userId }
        const code = typeof code_data === 'object' ? code_data.code : code_data;
        // We need the workspace ID. It should be set globally or passed.
        // Assuming we rely on the global `currentWorkspaceId` maintained in database.js 
        // OR we just import the getter from database.js if we implemented it.
        // For now, let's use the same pattern as `staff.js`: dynamic import of database state or passing it.
        // Actually, we can just enforce that `setLicenseWorkspaceId` is called or import from database.js

        const { getWorkspaceId } = await import('./database.js');
        const workspaceId = getWorkspaceId();

        if (!workspaceId) {
            return { success: false, message: 'No active workspace found.' };
        }

        const validLicense = validateLicenseCode(code);
        if (!validLicense) {
            return { success: false, message: 'Invalid license code format.' };
        }

        // Check if code is already used (Simple check: uniqueness in DB across all workspaces? 
        // MVP: Just allow it. Ideally we'd have a `used_licenses` table but for Offline, 
        // we can't easily sync "used" status across devices. 
        // LIMITATION: Code can be used on multiple devices. Accepted for Offline MVP.

        // Calculate Expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + validLicense.durationDays);
        const expiryISO = expiryDate.toISOString();

        // Update Workspace
        try {
            executeUpdate(
                `UPDATE workspaces 
                 SET license_key = ?, license_type = ?, license_expiry = ? 
                 WHERE id = ?`,
                [code, validLicense.planType, validLicense.isLifetime ? null : expiryISO, workspaceId]
            );

            // AUTO-PROMOTE CLAIMANT TO ADMIN
            // If a regular user claims a code, they become Admin.
            // We return a flag so the frontend (AuthContext) can handle the Supabase update.
            // We DO NOT update local SQLite 'profiles' because it doesn't exist.

            return {
                success: true,
                license: {
                    type: validLicense.planType,
                    expiry: validLicense.isLifetime ? null : expiryISO,
                    isLifetime: validLicense.isLifetime
                },
                promotedToAdmin: !!code_data?.userId // Return true if userId was provided
            };
        } catch (error) {
            console.error('License claim error:', error);
            return { success: false, message: 'Failed to apply license.' };
        }
    });

    // Get License Status
    ipcMain.handle('license:getStatus', async () => {
        const { getWorkspaceId } = await import('./database.js');
        const workspaceId = getWorkspaceId();

        if (!workspaceId) return { type: 'STARTER', expiry: null };

        const workspace = executeQueryOne(
            'SELECT license_type, license_expiry FROM workspaces WHERE id = ?',
            [workspaceId]
        );

        if (!workspace) return { type: 'STARTER', expiry: null };

        // Check Expiry
        if (workspace.license_expiry) {
            const expiry = new Date(workspace.license_expiry);
            const now = new Date();

            if (now > expiry) {
                // Expired! Revert to Starter
                executeUpdate(
                    `UPDATE workspaces 
                     SET license_type = 'STARTER', license_expiry = NULL 
                     WHERE id = ?`,
                    [workspaceId]
                );
                return { type: 'STARTER', expiry: null, expired: true };
            }
        }

        return {
            type: workspace.license_type || 'STARTER',
            expiry: workspace.license_expiry,
            isLifetime: !workspace.license_expiry && workspace.license_type === 'PRO'
        };
    });
};
