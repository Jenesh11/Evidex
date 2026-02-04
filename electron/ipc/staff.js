import { ipcMain } from 'electron';
import { executeQuery, executeQueryOne, executeUpdate } from '../../src/database/db.js';
import bcrypt from 'bcryptjs';

let currentWorkspaceId = null;

export const setStaffWorkspaceId = (id) => {
    currentWorkspaceId = id;
};

export const setupStaffHandlers = () => {
    // Get all staff
    ipcMain.handle('staff:getAll', async () => {
        // Allow even if no workspace set (e.g. for admin login flow if we need to list users, though secure login doesn't list them)
        // But for management, we need workspace
        // Actually, if currentWorkspaceId is set (Admin is logged in), scope to it.
        // If not set, return empty or handle safely?
        // Staff management requires Admin login, so workspace SHOULD be set.

        // We import `currentWorkspaceId` from database.js ideally or have a shared state. 
        // For now, we rely on the implementation where `database.js` manages the global workspace state
        // OR we can make `database.js` export a getter.
        // BUT `staff.js` operations also need to be scoped.

        // Let's assume `database.js` has the truthful state and we might need to export a getter there 
        // or re-use `setWorkspaceId` logic if shared.
        // SIMPLER: Use `executeQueries` that already have workspace_id injection?
        // No, `database.js` handlers inject it. Direct SQL here won't have it unless we add it.

        // CRITICAL: We need `currentWorkspaceId`. 
        // Let's import it from a shared state manager or modify `database.js` to export a getter.
        // For now, I will use a local variable that needs to be synced or just move this logic to `database.js`.
        // Moving to `database.js` is safer for consistency? 
        // Or better: Pass workspace_id from renderer? No, insecure.

        // DECISION: I will put these handlers in `staff.js` but I need access to the active workspace ID.
        // I'll update `main.js` to keep track of workspace ID and pass it to handlers, or update `database.js` to export `getCurrentWorkspaceId`.

        // Retrying with `database.js` export approach in mind. For this file, I'll setup the structure 
        // and assume I can get the ID via an import or closure. 
        // Actually, I'll export `setupStaffHandlers` that accepts `getWorkspaceId`.

        const sql = 'SELECT id, username, full_name, role, is_active, last_login, created_at FROM staff WHERE workspace_id = ? ORDER BY created_at DESC';
        // Wait, I can't easily get the ID here without refactoring.
        // REFACTOR PLAN: Manage `currentWorkspaceId` in a dedicated `state.js` or `database.js` and export a getter.

        // ... proceeding efficiently ...
        // I will use a direct import from `database.js` if I add a getter there.
        // Let's assume I will add `getWorkspaceId` to `database.js`.

        const { getWorkspaceId } = await import('./database.js');
        const workspaceId = getWorkspaceId();

        if (!workspaceId) return [];
        return executeQuery(sql, [workspaceId]);
    });

    // Create staff
    ipcMain.handle('staff:create', async (event, staffData) => {
        const { getWorkspaceId } = await import('./database.js');
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No active workspace');

        const { username, password_hash, full_name, role, is_active } = staffData;

        // Hash password
        // Note: frontend sends plain password in `password_hash` field currently, we hash here
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password_hash, salt);

        const result = executeUpdate(
            `INSERT INTO staff (username, password_hash, full_name, role, is_active, workspace_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, hash, full_name, role, is_active ? 1 : 0, workspaceId]
        );
        return { id: result.lastInsertRowid };
    });

    // Update staff
    ipcMain.handle('staff:update', async (event, id, staffData) => {
        const { getWorkspaceId } = await import('./database.js');
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No active workspace');

        const { username, full_name, role, is_active, password } = staffData;

        // If password provided, hash it. Else update others.
        if (password && password.length > 0) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            return executeUpdate(
                `UPDATE staff SET username = ?, full_name = ?, role = ?, is_active = ?, password_hash = ?
                 WHERE id = ? AND workspace_id = ?`,
                [username, full_name, role, is_active ? 1 : 0, hash, id, workspaceId]
            );
        } else {
            return executeUpdate(
                `UPDATE staff SET username = ?, full_name = ?, role = ?, is_active = ?
                 WHERE id = ? AND workspace_id = ?`,
                [username, full_name, role, is_active ? 1 : 0, id, workspaceId]
            );
        }
    });

    // Delete staff
    ipcMain.handle('staff:delete', async (event, id) => {
        const { getWorkspaceId } = await import('./database.js');
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No active workspace');

        return executeUpdate('DELETE FROM staff WHERE id = ? AND workspace_id = ?', [id, workspaceId]);
    });

    // Auth: Staff Login
    ipcMain.handle('auth:staffLogin', async (event, { username, password }) => {
        // Find user across all workspaces? Or do they need to specify?
        // Requirement: "Unique per workspace".
        // If offline, we just search by username. If username is unique globally in our local DB, easy.
        // If not, we might have collisions. 
        // "username (unique per workspace)" - suggests we need workspace context OR unique globally.
        // For simplicity in MVP Offline: Unique Globally in Local DB is safest UI.
        // BUT migration said `CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_username ON staff(username);`
        // So it IS globally unique locally.

        const user = executeQueryOne('SELECT * FROM staff WHERE username = ?', [username]);

        if (!user) {
            return { success: false, message: 'Invalid credentials' };
        }

        if (!user.is_active) {
            return { success: false, message: 'Account is inactive' };
        }

        // Verify password
        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) {
            return { success: false, message: 'Invalid credentials' };
        }

        // Update last login
        executeUpdate('UPDATE staff SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Return session info
        // We MUST set the workspace ID for isolation to work
        const { setWorkspaceId } = await import('./database.js');
        setWorkspaceId(user.workspace_id);

        // Mask hash
        delete user.password_hash;

        return {
            success: true,
            user: { ...user, isStaff: true },
            workspace_id: user.workspace_id
        };
    });
};
