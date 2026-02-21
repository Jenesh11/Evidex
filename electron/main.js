import { app, BrowserWindow, ipcMain, protocol, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;
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
import { setupFileHandlers } from './ipc/files.js';
import { setWorkspaceId } from './ipc/database.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const SPLASH_MIN_DURATION = 8000; // Minimum time to show splash screen (ms) - 8 seconds
let splashStartTime = 0;

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
let splashWindow = null;


// Robust dev mode detection
const isDev = !app.isPackaged || process.env.npm_lifecycle_event === 'dev';

// Register custom protocol handler for video and image files
app.whenReady().then(() => {
    console.log('[Main] Starting app. isDev:', isDev, 'isPackaged:', app.isPackaged);
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

const createSplashWindow = () => {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 500,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // Allowed because splash.html is trusted internal content
        }
    });

    splashStartTime = Date.now();
    splashWindow.loadFile(path.join(__dirname, '../src/splash.html'));

    splashWindow.on('closed', () => {
        splashWindow = null;
    });
};

// ... (skipping unchanged code) ...

function closeSplashAndShowMain() {
    const elapsed = Date.now() - splashStartTime;
    if (elapsed < SPLASH_MIN_DURATION) {
        const remaining = SPLASH_MIN_DURATION - elapsed;
        console.log(`Splash screen minimum duration not met. Waiting ${remaining}ms...`);
        setTimeout(() => closeSplashAndShowMain(), remaining);
        return;
    }

    if (!mainWindow) {
        createWindow();
    }

    // Ensure mainWindow is creating/showing
    // We already call mainWindow.show() in 'ready-to-show', but if it's already ready:
    if (mainWindow && !mainWindow.isVisible()) {
        mainWindow.show();
    }

    if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
    }
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        frame: false, // Remove title bar and window controls
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false, // Allow file:// protocol access for media files
        },
        backgroundColor: '#0a0a0a',
        show: false,
    });

    // Hide the menu bar
    Menu.setApplicationMenu(null);

    // Load the app
    // const isDev is already defined globally

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        // If splash is still open, wait for closeSplash to show main window
        if (!splashWindow) {
            mainWindow.show();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Window control handlers
    ipcMain.on('window:minimize', () => {
        mainWindow?.minimize();
    });

    ipcMain.on('window:maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow?.maximize();
        }
    });

    ipcMain.on('window:close', () => {
        mainWindow?.close();
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

    app.whenReady().then(async () => {
        // 1. Create Splash Window Immediately
        createSplashWindow();

        // 2. Initialize Database in background
        try {
            initDatabase();
            console.log('Database initialized');
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }

        // 3. Setup IPC Handlers
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
        setupFileHandlers();

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


        // 4. Auto Update Logic & Splash Screen Flow
        if (!isDev) {
            // ONLY check for updates if packaged (production)

            // Configure auto-updater - public repo, no token needed for downloads
            autoUpdater.autoDownload = false;
            autoUpdater.autoInstallOnAppQuit = true;

            // Notify splash we are checking
            splashWindow.webContents.on('did-finish-load', () => {
                splashWindow.webContents.send('version', app.getVersion());

                // Skip auto-update in development mode
                if (!app.isPackaged) {
                    console.log('[Auto-Update] Skipping update check in development mode');
                    splashWindow.webContents.send('update-message', 'Starting application...');
                    setTimeout(closeSplashAndShowMain, 1000);
                    return;
                }

                splashWindow.webContents.send('update-message', 'Checking for updates...');

                // Enable auto-download for splash screen updates
                autoUpdater.autoDownload = true;

                // Only check after splash loads
                autoUpdater.checkForUpdatesAndNotify().catch(err => {
                    console.error('Update check failed:', err);
                    splashWindow?.webContents.send('update-message', 'Starting application...');
                    setTimeout(closeSplashAndShowMain, 1000);
                });
            });

            autoUpdater.on('checking-for-update', () => {
                console.log('Checking for updates...');
                splashWindow?.webContents.send('update-message', 'Checking for updates...');
            });

            autoUpdater.on('update-available', (info) => {
                console.log('Update available:', info.version);
                splashWindow?.webContents.send('update-message', `Update v${info.version} found. Downloading...`);
            });

            autoUpdater.on('update-not-available', () => {
                console.log('No updates available');
                splashWindow?.webContents.send('update-message', 'Starting application...');
                setTimeout(closeSplashAndShowMain, 1000);
            });

            autoUpdater.on('error', (err) => {
                console.error('AutoUpdate Error:', err?.message || err);
                splashWindow?.webContents.send('update-message', 'Starting application...');
                setTimeout(closeSplashAndShowMain, 1500);
            });

            autoUpdater.on('download-progress', (progressObj) => {
                let log_message = "Download speed: " + progressObj.bytesPerSecond;
                log_message = log_message + ' - Downloaded ' + progressObj.percent.toFixed(2) + '%';
                log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
                console.log(log_message);

                splashWindow?.webContents.send('update-message', `Downloading update...`);
                splashWindow?.webContents.send('download-progress', progressObj.percent);
            });

            autoUpdater.on('update-downloaded', (info) => {
                console.log('Update downloaded:', info.version);
                splashWindow?.webContents.send('update-message', 'Update downloaded. Restarting...');
                setTimeout(() => {
                    autoUpdater.quitAndInstall(true, true);
                }, 1500);
            });

            // Runtime update checks (every 4 hours)
            const checkForRuntimeUpdates = () => {
                if (!mainWindow || mainWindow.isDestroyed()) return;

                console.log('[Auto-Update] Checking for updates (runtime)...');
                autoUpdater.autoDownload = false; // Don't auto-download during runtime

                autoUpdater.checkForUpdates().then(result => {
                    if (result && result.updateInfo && result.updateInfo.version !== app.getVersion()) {
                        console.log('[Auto-Update] Update available:', result.updateInfo.version);
                        // Notify renderer about update
                        mainWindow.webContents.send('update-available', {
                            version: result.updateInfo.version,
                            releaseNotes: result.updateInfo.releaseNotes,
                            releaseName: result.updateInfo.releaseName
                        });
                    }
                }).catch(err => {
                    console.error('[Auto-Update] Runtime check failed:', err.message);
                });
            };

            // Check every 4 hours
            setInterval(checkForRuntimeUpdates, 4 * 60 * 60 * 1000);

            // Handle manual update download request from renderer
            ipcMain.on('download-update', () => {
                console.log('[Auto-Update] Manual download requested');
                autoUpdater.autoDownload = true;
                autoUpdater.downloadUpdate().then(() => {
                    console.log('[Auto-Update] Download started');
                }).catch(err => {
                    console.error('[Auto-Update] Download failed:', err);
                    mainWindow?.webContents.send('update-error', err.message);
                });
            });

            // Handle install update request
            ipcMain.on('install-update', () => {
                console.log('[Auto-Update] Installing update and restarting...');
                autoUpdater.quitAndInstall();
            });

        } else {
            // DEV MODE: Simulate loading sequence for 8 seconds
            splashWindow.webContents.on('did-finish-load', () => {
                splashWindow.webContents.send('version', app.getVersion());

                const steps = [
                    { msg: 'Initializing System...', delay: 500 },
                    { msg: 'Loading Modules...', delay: 2000 },
                    { msg: 'Verifying Integrity...', delay: 4000 },
                    { msg: 'Connecting to Database...', delay: 6000 },
                    { msg: 'Starting Application...', delay: 7500 }
                ];

                steps.forEach(step => {
                    setTimeout(() => {
                        if (splashWindow && !splashWindow.isDestroyed()) {
                            splashWindow.webContents.send('update-message', step.msg);
                        }
                    }, step.delay);
                });

                setTimeout(() => {
                    closeSplashAndShowMain();
                }, 8000);
            });
        }

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
