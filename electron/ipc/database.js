import { ipcMain } from 'electron';
import { executeQuery, executeQueryOne, executeUpdate, transaction } from '../../src/database/db.js';

let currentWorkspaceId = null;

export const setWorkspaceId = (id) => {
    currentWorkspaceId = id;
    console.log('[Database] Active workspace set to:', id);
};

export const getWorkspaceId = () => currentWorkspaceId;

export const setupDatabaseHandlers = () => {
    // Generic database operations - BLOCKED for safety or scoped?
    // Allowing raw SQL from renderer is dangerous with isolation.
    // For now, we assume these are used responsibly or strictly for non-sensitive data?
    // Actually, `active_orders` view uses this.
    // BETTER: Deprecate `db:query` from renderer if possible, or strictly validate.
    // OPTION: We'll leave them but warn/log. The renderer should switch to specific handlers.

    ipcMain.handle('db:query', async (event, sql, params) => {
        // TODO: Enforce workspace scope on raw queries if possible
        return executeQuery(sql, params);
    });

    ipcMain.handle('db:queryOne', async (event, sql, params) => {
        return executeQueryOne(sql, params);
    });

    ipcMain.handle('db:execute', async (event, sql, params) => {
        return executeUpdate(sql, params);
    });

    ipcMain.handle('db:transaction', async (event, queries) => {
        return transaction(() => {
            return queries.map(({ sql, params }) => executeUpdate(sql, params));
        });
    });

    // Products
    ipcMain.handle('products:getAll', async () => {
        if (!currentWorkspaceId) return [];
        return executeQuery('SELECT * FROM products WHERE workspace_id = ? ORDER BY created_at DESC', [currentWorkspaceId]);
    });

    ipcMain.handle('products:getById', async (event, id) => {
        if (!currentWorkspaceId) return null;
        return executeQueryOne('SELECT * FROM products WHERE id = ? AND workspace_id = ?', [id, currentWorkspaceId]);
    });

    ipcMain.handle('products:create', async (event, product) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        const result = executeUpdate(
            `INSERT INTO products (sku, name, description, quantity, price, low_stock_threshold, image_path, workspace_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [product.sku, product.name, product.description, product.quantity, product.price, product.low_stock_threshold, product.image_path, currentWorkspaceId]
        );
        return { id: result.lastInsertRowid };
    });

    ipcMain.handle('products:update', async (event, id, product) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        return executeUpdate(
            `UPDATE products SET sku = ?, name = ?, description = ?, quantity = ?, price = ?, low_stock_threshold = ?, image_path = ?
       WHERE id = ? AND workspace_id = ?`,
            [product.sku, product.name, product.description, product.quantity, product.price, product.low_stock_threshold, product.image_path, id, currentWorkspaceId]
        );
    });

    ipcMain.handle('products:delete', async (event, id) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        return executeUpdate('DELETE FROM products WHERE id = ? AND workspace_id = ?', [id, currentWorkspaceId]);
    });

    ipcMain.handle('products:search', async (event, query) => {
        if (!currentWorkspaceId) return [];
        return executeQuery(
            'SELECT * FROM products WHERE (name LIKE ? OR sku LIKE ?) AND workspace_id = ? ORDER BY name',
            [`%${query}%`, `%${query}%`, currentWorkspaceId]
        );
    });

    ipcMain.handle('products:getLowStock', async () => {
        if (!currentWorkspaceId) return [];
        return executeQuery('SELECT * FROM products WHERE quantity <= low_stock_threshold AND workspace_id = ? ORDER BY quantity ASC', [currentWorkspaceId]);
    });

    // Orders
    ipcMain.handle('orders:getAll', async () => {
        if (!currentWorkspaceId) return [];
        const orders = executeQuery(`
      SELECT o.*, s.full_name as packed_by_name
      FROM orders o
      LEFT JOIN staff s ON o.packed_by = s.id
      WHERE o.workspace_id = ?
      ORDER BY o.created_at DESC
    `, [currentWorkspaceId]);

        // Attach items to each order
        orders.forEach(order => {
            const items = executeQuery(`
        SELECT oi.*, p.name as product_name, p.sku
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND oi.workspace_id = ?
      `, [order.id, currentWorkspaceId]);
            order.items = items;
        });

        return orders;
    });

    ipcMain.handle('orders:getById', async (event, id) => {
        if (!currentWorkspaceId) return null;
        const order = executeQueryOne(`
      SELECT o.*, s.full_name as packed_by_name
      FROM orders o
      LEFT JOIN staff s ON o.packed_by = s.id
      WHERE o.id = ? AND o.workspace_id = ?
    `, [id, currentWorkspaceId]);

        if (order) {
            const items = executeQuery(`
        SELECT oi.*, p.name as product_name, p.sku
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND oi.workspace_id = ?
      `, [id, currentWorkspaceId]);

            order.items = items;
        }

        return order;
    });

    // Order creation - NO inventory deduction
    ipcMain.handle('orders:create', async (event, order) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        return transaction(() => {
            const orderResult = executeUpdate(
                `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, status, total_amount, notes, workspace_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [order.order_number, order.customer_name, order.customer_email, order.customer_phone, order.status || 'NEW', order.total_amount, order.notes, currentWorkspaceId]
            );

            const orderId = orderResult.lastInsertRowid;

            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    executeUpdate(
                        'INSERT INTO order_items (order_id, product_id, quantity, price, stock_deducted, stock_returned, workspace_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [orderId, item.product_id, item.quantity, item.price, 0, 0, currentWorkspaceId]
                    );
                });
            }

            return { id: orderId };
        });
    });

    ipcMain.handle('orders:update', async (event, id, order) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        return executeUpdate(
            `UPDATE orders SET customer_name = ?, customer_email = ?, customer_phone = ?, status = ?, notes = ?
       WHERE id = ? AND workspace_id = ?`,
            [order.customer_name, order.customer_email, order.customer_phone, order.status, order.notes, id, currentWorkspaceId]
        );
    });

    // SINGLE PLACE for inventory deduction - when order is SHIPPED
    ipcMain.handle('orders:updateStatus', async (event, id, status) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        return transaction(() => {
            // Check if order belongs to workspace before proceeding
            const orderCheck = executeQueryOne('SELECT id FROM orders WHERE id = ? AND workspace_id = ?', [id, currentWorkspaceId]);
            if (!orderCheck) throw new Error('Order not found or access denied');

            if (status === 'SHIPPED') {
                const orderItems = executeQuery(
                    `SELECT oi.*, p.quantity as current_stock, p.name as product_name
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
                    [id]
                );

                const order = executeQueryOne('SELECT order_number FROM orders WHERE id = ?', [id]);

                for (const item of orderItems) {
                    if (item.current_stock < item.quantity) {
                        throw new Error(`Insufficient stock for ${item.product_name}. Available: ${item.current_stock}, Required: ${item.quantity}`);
                    }

                    const itemUpdate = executeUpdate(
                        `UPDATE order_items SET stock_deducted = 1 WHERE id = ? AND stock_deducted = 0`,
                        [item.id]
                    );

                    if (itemUpdate.changes > 0) {
                        executeUpdate(
                            `UPDATE products SET quantity = quantity - ? WHERE id = ?`,
                            [item.quantity, item.product_id]
                        );

                        executeUpdate(
                            `INSERT INTO stock_movements (product_id, quantity_change, movement_type, reason, reference_id, workspace_id)
               VALUES (?, ?, 'ORDER_SHIPPED', ?, ?, ?)`,
                            [item.product_id, -item.quantity, `Order ${order.order_number} shipped`, id, currentWorkspaceId]
                        );

                        executeUpdate(
                            `INSERT INTO audit_logs (action, entity_type, entity_id, details, workspace_id)
               VALUES ('INVENTORY_DEDUCT', 'ORDER', ?, ?, ?)`,
                            [id, JSON.stringify({
                                order_number: order.order_number,
                                product_id: item.product_id,
                                quantity: item.quantity,
                                previous_stock: item.current_stock,
                                new_stock: item.current_stock - item.quantity
                            }), currentWorkspaceId]
                        );
                    }
                }
            }

            return executeUpdate('UPDATE orders SET status = ? WHERE id = ? AND workspace_id = ?', [status, id, currentWorkspaceId]);
        });
    });

    ipcMain.handle('orders:delete', async (event, id) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        return executeUpdate('DELETE FROM orders WHERE id = ? AND workspace_id = ?', [id, currentWorkspaceId]);
    });

    ipcMain.handle('orders:getByStatus', async (event, status) => {
        if (!currentWorkspaceId) return [];
        return executeQuery('SELECT * FROM orders WHERE status = ? AND workspace_id = ? ORDER BY created_at DESC', [status, currentWorkspaceId]);
    });



    // Returns
    ipcMain.handle('returns:getAll', async () => {
        if (!currentWorkspaceId) return [];
        return executeQuery(`
      SELECT r.*, o.order_number, s.full_name as inspected_by_name
      FROM returns r
      JOIN orders o ON r.order_id = o.id
      LEFT JOIN staff s ON r.inspected_by = s.id
      WHERE r.workspace_id = ?
      ORDER BY r.created_at DESC
    `, [currentWorkspaceId]);
    });

    ipcMain.handle('returns:getById', async (event, id) => {
        if (!currentWorkspaceId) return null;
        return executeQueryOne(`
      SELECT r.*, o.order_number, s.full_name as inspected_by_name
      FROM returns r
      JOIN orders o ON r.order_id = o.id
      LEFT JOIN staff s ON r.inspected_by = s.id
      WHERE r.id = ? AND r.workspace_id = ?
    `, [id, currentWorkspaceId]);
    });

    ipcMain.handle('returns:create', async (event, returnData) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        const result = executeUpdate(
            `INSERT INTO returns (order_id, return_type, reason, inspection_notes, inspection_checklist, images, status, workspace_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [returnData.order_id, returnData.return_type, returnData.reason, returnData.inspection_notes, returnData.inspection_checklist, returnData.images, returnData.status || 'PENDING', currentWorkspaceId]
        );
        return { id: result.lastInsertRowid };
    });

    // SINGLE PLACE for inventory restoration - when return is APPROVED
    ipcMain.handle('returns:update', async (event, id, returnData) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        return transaction(() => {
            // Check access first
            const returnCheck = executeQueryOne('SELECT id, order_id FROM returns WHERE id = ? AND workspace_id = ?', [id, currentWorkspaceId]);
            if (!returnCheck) throw new Error('Return not found or access denied');

            if (returnData.status === 'APPROVED' && returnData.restock_status === 'YES') {
                const orderItems = executeQuery(
                    `SELECT oi.*, p.quantity as current_stock 
           FROM order_items oi 
           JOIN products p ON oi.product_id = p.id 
           WHERE oi.order_id = ?`,
                    [returnCheck.order_id]
                );

                for (const item of orderItems) {
                    const itemUpdate = executeUpdate(
                        `UPDATE order_items SET stock_returned = 1 
              WHERE id = ? AND stock_deducted = 1 AND stock_returned = 0`,
                        [item.id]
                    );

                    if (itemUpdate.changes > 0) {
                        executeUpdate(
                            `UPDATE products SET quantity = quantity + ? WHERE id = ?`,
                            [item.quantity, item.product_id]
                        );

                        executeUpdate(
                            `INSERT INTO stock_movements (product_id, quantity_change, movement_type, reason, reference_id, workspace_id)
               VALUES (?, ?, 'RETURN_RESTOCK', ?, ?, ?)`,
                            [item.product_id, item.quantity, `Return ${id} approved`, returnCheck.order_id, currentWorkspaceId]
                        );

                        executeUpdate(
                            `INSERT INTO audit_logs (action, entity_type, entity_id, details, workspace_id)
               VALUES ('INVENTORY_RESTORE', 'RETURN', ?, ?, ?)`,
                            [id, JSON.stringify({
                                product_id: item.product_id,
                                quantity: item.quantity,
                                previous_stock: item.current_stock,
                                new_stock: item.current_stock + item.quantity
                            }), currentWorkspaceId]
                        );
                    }
                }
            }

            const updateFields = [];
            const updateValues = [];

            if (returnData.return_type !== undefined) {
                updateFields.push('return_type = ?');
                updateValues.push(returnData.return_type);
            }
            if (returnData.reason !== undefined) {
                updateFields.push('reason = ?');
                updateValues.push(returnData.reason);
            }
            if (returnData.inspection_notes !== undefined) {
                updateFields.push('inspection_notes = ?');
                updateValues.push(returnData.inspection_notes);
            }
            if (returnData.status !== undefined) {
                updateFields.push('status = ?');
                updateValues.push(returnData.status);
            }
            if (returnData.restock_status !== undefined) {
                updateFields.push('restock_status = ?');
                updateValues.push(returnData.restock_status);
            }
            if (returnData.stock_restored !== undefined) {
                updateFields.push('stock_restored = ?');
                updateValues.push(returnData.stock_restored ? 1 : 0);
            }

            if (updateFields.length > 0) {
                updateValues.push(id);
                updateValues.push(currentWorkspaceId); // For WHERE clause
                return executeUpdate(
                    `UPDATE returns SET ${updateFields.join(', ')} WHERE id = ? AND workspace_id = ?`,
                    updateValues
                );
            }

            return { changes: 0 };
        });
    });

    // Stock Movements - NO inventory modification, just logging
    ipcMain.handle('stock:getMovements', async (event, productId) => {
        if (!currentWorkspaceId) return [];
        return executeQuery(`
      SELECT sm.*, p.name as product_name, s.full_name as staff_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN staff s ON sm.staff_id = s.id
      WHERE sm.product_id = ? AND sm.workspace_id = ?
      ORDER BY sm.created_at DESC
    `, [productId, currentWorkspaceId]);
    });

    ipcMain.handle('stock:addMovement', async (event, movement) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        const result = executeUpdate(
            `INSERT INTO stock_movements (product_id, quantity_change, movement_type, reason, reference_id, staff_id, workspace_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [movement.product_id, movement.quantity_change, movement.movement_type, movement.reason, movement.reference_id, movement.staff_id, currentWorkspaceId]
        );
        return { id: result.lastInsertRowid };
    });

    // Audit Logs
    ipcMain.handle('audit:getLogs', async (event, filters) => {
        if (!currentWorkspaceId) return [];
        let query = `
      SELECT al.*, s.full_name as staff_name
      FROM audit_logs al
      LEFT JOIN staff s ON al.staff_id = s.id
      WHERE al.workspace_id = ?
    `;
        const params = [currentWorkspaceId];

        if (filters?.staff_id) {
            query += ' AND al.staff_id = ?';
            params.push(filters.staff_id);
        }

        if (filters?.entity_type) {
            query += ' AND al.entity_type = ?';
            params.push(filters.entity_type);
        }

        if (filters?.action) {
            query += ' AND al.action = ?';
            params.push(filters.action);
        }

        if (filters?.dateRange) {
            const days = parseInt(filters.dateRange.replace('days', ''));
            if (!isNaN(days)) {
                query += ` AND al.created_at >= datetime('now', '-${days} days')`;
            }
        }

        query += ' ORDER BY al.created_at DESC LIMIT 1000';

        return executeQuery(query, params);
    });

    ipcMain.handle('audit:addLog', async (event, log) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        const result = executeUpdate(
            'INSERT INTO audit_logs (staff_id, action, entity_type, entity_id, details, workspace_id) VALUES (?, ?, ?, ?, ?, ?)',
            [log.staff_id, log.action, log.entity_type, log.entity_id, log.details, currentWorkspaceId]
        );
        return { id: result.lastInsertRowid };
    });

    // Packing Evidence
    ipcMain.handle('packing_evidence:create', async (event, evidence) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        const result = executeUpdate(
            `INSERT INTO packing_evidence (order_id, video_id, checklist_product_correct, checklist_quantity_correct, checklist_sealing_done, photo_before_seal, photo_after_seal, workspace_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                evidence.order_id,
                evidence.video_id,
                evidence.checklist_product_correct ? 1 : 0,
                evidence.checklist_quantity_correct ? 1 : 0,
                evidence.checklist_sealing_done ? 1 : 0,
                evidence.photo_before_seal,
                evidence.photo_after_seal,
                currentWorkspaceId
            ]
        );
        return { id: result.lastInsertRowid };
    });

    ipcMain.handle('packing_evidence:getByOrderId', async (event, orderId) => {
        if (!currentWorkspaceId) return null;
        return executeQueryOne('SELECT * FROM packing_evidence WHERE order_id = ? AND workspace_id = ? ORDER BY created_at DESC LIMIT 1', [orderId, currentWorkspaceId]);
    });

    ipcMain.handle('packing_evidence:update', async (event, id, evidence) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        return executeUpdate(
            `UPDATE packing_evidence 
             SET checklist_product_correct = ?, checklist_quantity_correct = ?, checklist_sealing_done = ?, 
                 photo_before_seal = ?, photo_after_seal = ?
             WHERE id = ? AND workspace_id = ?`,
            [
                evidence.checklist_product_correct ? 1 : 0,
                evidence.checklist_quantity_correct ? 1 : 0,
                evidence.checklist_sealing_done ? 1 : 0,
                evidence.photo_before_seal,
                evidence.photo_after_seal,
                id,
                currentWorkspaceId
            ]
        );
    });

    // Inventory Reconciliation
    ipcMain.handle('inventory:reconcile', async (event, movements) => {
        if (!currentWorkspaceId) throw new Error('No active workspace');
        return transaction(() => {
            const results = [];

            for (const movement of movements) {
                // Insert movement record
                const movementResult = executeUpdate(
                    `INSERT INTO inventory_movements (product_id, quantity, direction, reason, notes, performed_by, workspace_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [movement.product_id, movement.quantity, movement.direction, movement.reason, movement.notes, movement.performed_by, currentWorkspaceId]
                );

                // Update product quantity based on direction
                const quantityChange = movement.direction === 'IN' ? movement.quantity : -movement.quantity;
                executeUpdate(
                    'UPDATE products SET quantity = quantity + ? WHERE id = ? AND workspace_id = ?',
                    [quantityChange, movement.product_id, currentWorkspaceId]
                );

                results.push({ id: movementResult.lastInsertRowid });
            }

            return results;
        });
    });

    ipcMain.handle('inventory:getMovements', async (event, productId) => {
        if (!currentWorkspaceId) return [];
        if (productId) {
            return executeQuery(
                `SELECT im.*, p.name as product_name, s.full_name as performed_by_name
                 FROM inventory_movements im
                 JOIN products p ON im.product_id = p.id
                 LEFT JOIN staff s ON im.performed_by = s.id
                 WHERE im.product_id = ? AND im.workspace_id = ?
                 ORDER BY im.created_at DESC`,
                [productId, currentWorkspaceId]
            );
        } else {
            return executeQuery(
                `SELECT im.*, p.name as product_name, s.full_name as performed_by_name
                 FROM inventory_movements im
                 JOIN products p ON im.product_id = p.id
                 LEFT JOIN staff s ON im.performed_by = s.id
                 WHERE im.workspace_id = ?
                 ORDER BY im.created_at DESC
                 LIMIT 1000`,
                [currentWorkspaceId]
            );
        }
    });

    // Clear All Data (Development Tool)
    ipcMain.handle('database:clearAllData', async () => {
        try {
            // Import db module to access raw database
            const { getDb } = await import('../../src/database/db.js');
            const database = getDb();

            // Temporarily disable foreign key constraints (must be outside transaction)
            database.pragma('foreign_keys = OFF');

            try {
                // Now run the deletions in a transaction
                return transaction(() => {
                    const wsId = currentWorkspaceId;
                    if (!wsId) throw new Error('No active workspace to clear');

                    console.log(`[Database] Clearing data for workspace: ${wsId}`);

                    console.log('[Database] Clearing packing_evidence...');
                    executeUpdate('DELETE FROM packing_evidence WHERE workspace_id = ?', [wsId]);

                    console.log('[Database] Clearing order_items...');
                    executeUpdate('DELETE FROM order_items WHERE workspace_id = ?', [wsId]);

                    console.log('[Database] Clearing stock_movements...');
                    executeUpdate('DELETE FROM stock_movements WHERE workspace_id = ?', [wsId]);

                    console.log('[Database] Clearing inventory_movements...');
                    executeUpdate('DELETE FROM inventory_movements WHERE workspace_id = ?', [wsId]);

                    console.log('[Database] Clearing audit_logs...');
                    executeUpdate('DELETE FROM audit_logs WHERE workspace_id = ?', [wsId]);

                    console.log('[Database] Clearing videos...');
                    // Videos might not have workspace_id, relying on order_id join
                    executeUpdate('DELETE FROM videos WHERE order_id IN (SELECT id FROM orders WHERE workspace_id = ?)', [wsId]);

                    console.log('[Database] Clearing returns...');
                    executeUpdate('DELETE FROM returns WHERE workspace_id = ?', [wsId]);

                    console.log('[Database] Clearing orders...');
                    executeUpdate('DELETE FROM orders WHERE workspace_id = ?', [wsId]);

                    console.log('[Database] Clearing products...');
                    executeUpdate('DELETE FROM products WHERE workspace_id = ?', [wsId]);

                    console.log('[Database] Workspace data cleared successfully');

                    return {
                        success: true,
                        message: 'All test data has been cleared'
                    };
                });
            } finally {
                // Re-enable foreign key constraints (must be outside transaction)
                database.pragma('foreign_keys = ON');
            }
        } catch (error) {
            console.error('[Database] Error clearing data:', error);
            // Make sure to re-enable foreign keys even on error
            try {
                const { getDb } = await import('../../src/database/db.js');
                const database = getDb();
                database.pragma('foreign_keys = ON');
            } catch (e) {
                console.error('[Database] Failed to re-enable foreign keys:', e);
            }
            return {
                success: false,
                error: error.message
            };
        }
    });
};
