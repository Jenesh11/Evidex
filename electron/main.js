import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, closeDatabase } from '../src/database/db.js';
import { setupDatabaseHandlers } from './ipc/database.js';
import { setupVideoHandlers } from './ipc/video.js';
import { setupSettingsHandlers } from './ipc/settings.js';

import { setupExportHandlers } from './ipc/export.js';
import { setupPhotoHandlers } from './ipc/photos.js';
import { setupBackupHandlers } from './ipc/backup.js';
import { setupStoreHandlers } from './services/storeService.js';
import { shouldRunBackup, createBackup, cleanOldBackups } from './services/backupService.js';
import { setupSystemHandlers } from './ipc/system.js';
import { setupStaffHandlers } from './ipc/staff.js';
import { setupLicenseHandlers } from './ipc/license.js';
import { setWorkspaceId } from './ipc/database.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register custom protocol BEFORE app is ready
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'video-evidence',
        privileges: {
            bypassCSP: true,
            supportFetchAPI: true,
            stream: true,
            standard: true,
            secure: true
        }
    }
]);

let mainWindow = null;

// Register custom protocol handler for video and image files
app.whenReady().then(() => {
    protocol.registerFileProtocol('video-evidence', (request, callback) => {
        const url = request.url.replace('video-evidence://', '');
        try {
            const decodedPath = decodeURIComponent(url);
            console.log('[Protocol] Loading file:', decodedPath);


            callback({ path: decodedPath });
        } catch (error) {
            console.error('[Protocol] Error:', error);
            callback({ error: -2 }); // net::ERR_FAILED
        }
    });
});

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false, // Allow file:// protocol access for media files
        },
        backgroundColor: '#0a0a0a',
        show: false,
    });

    // Load the app
    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

// Deep linking setup
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('evidex', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('evidex');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();

            // Handle deep link
            const url = commandLine.find(arg => arg.startsWith('evidex://'));
            if (url) {
                mainWindow.webContents.send('auth:deep-link', url);
            }
        }
    });

    app.whenReady().then(() => {
        // Initialize database
        try {
            initDatabase();
            console.log('Database initialized');
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }

        // Setup IPC handlers
        setupDatabaseHandlers();
        setupVideoHandlers();
        setupSettingsHandlers();
        setupExportHandlers();
        setupPhotoHandlers();
        setupBackupHandlers();
        setupStoreHandlers();
        setupSystemHandlers();
        setupStaffHandlers();
        setupLicenseHandlers();

        ipcMain.handle('system:openExternal', async (event, url) => {
            const { shell } = await import('electron');
            await shell.openExternal(url);
        });

        // Workspace Management
        ipcMain.handle('auth:set-workspace', (event, workspaceId) => {
            console.log('[Main] Setting active workspace:', workspaceId);
            setWorkspaceId(workspaceId);
            return true;
        });

        // Backup Scheduler
        const runBackupCheck = async () => {
            const due = await shouldRunBackup();
            if (due) {
                console.log('Running scheduled backup...');
                const result = await createBackup();
                if (result.success) {
                    console.log('Backup created successfully:', result.fileName);
                    await cleanOldBackups();
                } else {
                    console.error('Backup failed:', result.error);
                }
            }
        };

        // Run check on startup
        setTimeout(runBackupCheck, 5000); // 5 sec delay to let app settle

        // Schedule hourly check
        setInterval(runBackupCheck, 60 * 60 * 1000);

        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    });
}

app.on('window-all-closed', () => {
    closeDatabase();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    closeDatabase();
});
