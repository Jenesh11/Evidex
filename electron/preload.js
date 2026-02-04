const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Database operations
    database: {
        query: (sql, params) => ipcRenderer.invoke('db:query', sql, params),
        queryOne: (sql, params) => ipcRenderer.invoke('db:queryOne', sql, params),
        execute: (sql, params) => ipcRenderer.invoke('db:execute', sql, params),
        transaction: (queries) => ipcRenderer.invoke('db:transaction', queries),
        clearAllData: () => ipcRenderer.invoke('database:clearAllData'),
    },

    // Legacy alias for backward compatibility
    db: {
        query: (sql, params) => ipcRenderer.invoke('db:query', sql, params),
        queryOne: (sql, params) => ipcRenderer.invoke('db:queryOne', sql, params),
        execute: (sql, params) => ipcRenderer.invoke('db:execute', sql, params),
        transaction: (queries) => ipcRenderer.invoke('db:transaction', queries),
    },

    // Products
    products: {
        getAll: () => ipcRenderer.invoke('products:getAll'),
        getById: (id) => ipcRenderer.invoke('products:getById', id),
        create: (product) => ipcRenderer.invoke('products:create', product),
        update: (id, product) => ipcRenderer.invoke('products:update', id, product),
        delete: (id) => ipcRenderer.invoke('products:delete', id),
        search: (query) => ipcRenderer.invoke('products:search', query),
        getLowStock: () => ipcRenderer.invoke('products:getLowStock'),
    },

    // Orders
    orders: {
        getAll: () => ipcRenderer.invoke('orders:getAll'),
        getById: (id) => ipcRenderer.invoke('orders:getById', id),
        create: (order) => ipcRenderer.invoke('orders:create', order),
        update: (id, order) => ipcRenderer.invoke('orders:update', id, order),
        updateStatus: (id, status) => ipcRenderer.invoke('orders:updateStatus', id, status),
        delete: (id) => ipcRenderer.invoke('orders:delete', id),
        getByStatus: (status) => ipcRenderer.invoke('orders:getByStatus', status),
    },

    // Videos
    videos: {
        save: (videoData) => ipcRenderer.invoke('video:save', videoData),
        getByOrderId: (orderId) => ipcRenderer.invoke('video:getByOrderId', orderId),
        verify: (videoId) => ipcRenderer.invoke('video:verify', videoId),
        getPath: (videoId) => ipcRenderer.invoke('video:getPath', videoId),
    },

    // Staff
    staff: {
        getAll: () => ipcRenderer.invoke('staff:getAll'),
        getById: (id) => ipcRenderer.invoke('staff:getById', id),
        create: (staff) => ipcRenderer.invoke('staff:create', staff),
        update: (id, staff) => ipcRenderer.invoke('staff:update', id, staff),
        delete: (id) => ipcRenderer.invoke('staff:delete', id),
    },

    // Returns
    returns: {
        getAll: () => ipcRenderer.invoke('returns:getAll'),
        getById: (id) => ipcRenderer.invoke('returns:getById', id),
        create: (returnData) => ipcRenderer.invoke('returns:create', returnData),
        update: (id, returnData) => ipcRenderer.invoke('returns:update', id, returnData),
    },

    // Stock Movements
    stock: {
        getMovements: (productId) => ipcRenderer.invoke('stock:getMovements', productId),
        addMovement: (movement) => ipcRenderer.invoke('stock:addMovement', movement),
    },

    // Audit Logs
    audit: {
        getLogs: (filters) => ipcRenderer.invoke('audit:getLogs', filters),
        addLog: (log) => ipcRenderer.invoke('audit:addLog', log),
    },

    // Secure Store
    store: {
        get: (key) => ipcRenderer.invoke('store:get', key),
        set: (key, value) => ipcRenderer.invoke('store:set', key, value),
        delete: (key) => ipcRenderer.invoke('store:delete', key),
    },

    auth: {
        onDeepLink: (callback) => ipcRenderer.on('auth:deep-link', (event, url) => callback(url)),
        setWorkspace: (workspaceId) => ipcRenderer.invoke('auth:set-workspace', workspaceId),
        staffLogin: (credentials) => ipcRenderer.invoke('auth:staffLogin', credentials),
    },

    // Staff operations
    staff: {
        getAll: () => ipcRenderer.invoke('staff:getAll'),
        create: (staff) => ipcRenderer.invoke('staff:create', staff),
        update: (id, staff) => ipcRenderer.invoke('staff:update', id, staff),
        delete: (id) => ipcRenderer.invoke('staff:delete', id),
    },

    // License
    license: {
        claim: (code) => ipcRenderer.invoke('license:claim', code),
        getStatus: () => ipcRenderer.invoke('license:getStatus'),
    },

    // File operations
    files: {
        selectFile: () => ipcRenderer.invoke('files:selectFile'),
        saveFile: (data, filename) => ipcRenderer.invoke('files:saveFile', data, filename),
        getDataPath: () => ipcRenderer.invoke('files:getDataPath'),
    },

    // System
    system: {
        backup: () => ipcRenderer.invoke('system:backup'),
        getDiskUsage: () => ipcRenderer.invoke('system:getDiskUsage'),
        openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
    },

    settings: {
        get: (key) => ipcRenderer.invoke('settings:get', key),
        set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
        getAll: () => ipcRenderer.invoke('settings:getAll'),
    },

    // Export
    export: {
        generateEvidence: (orderId, returnId) => ipcRenderer.invoke('export:generateEvidence', orderId, returnId),
    },

    // Photos
    photos: {
        save: (photoData) => ipcRenderer.invoke('photos:save', photoData),
        getByOrderId: (orderId) => ipcRenderer.invoke('photos:getByOrderId', orderId),
        delete: (filePath) => ipcRenderer.invoke('photos:delete', filePath),
    },

    // Packing Evidence
    packingEvidence: {
        create: (evidence) => ipcRenderer.invoke('packing_evidence:create', evidence),
        getByOrderId: (orderId) => ipcRenderer.invoke('packing_evidence:getByOrderId', orderId),
        update: (id, evidence) => ipcRenderer.invoke('packing_evidence:update', id, evidence),
    },

    // Inventory
    inventory: {
        reconcile: (movements) => ipcRenderer.invoke('inventory:reconcile', movements),
        getMovements: (productId) => ipcRenderer.invoke('inventory:getMovements', productId),
    },

    // Settings
    settings: {
        get: (key) => ipcRenderer.invoke('settings:get', key),
        set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    },

    // Backups
    backup: {
        create: () => ipcRenderer.invoke('backup:create'),
        getStats: () => ipcRenderer.invoke('backup:getStats'),
        getSettings: () => ipcRenderer.invoke('backup:getSettings'),
        updateSettings: (settings) => ipcRenderer.invoke('backup:updateSettings', settings),
    },
});

console.log('✅ Preload script loaded - electronAPI exposed to renderer');
