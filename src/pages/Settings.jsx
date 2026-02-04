import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Camera, HardDrive, Save, Crown, ArrowRight, Trash2, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/utils';
import { PLANS, PLAN_FEATURES, hasFeature } from '@/config/plans';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
    const [cameraDevices, setCameraDevices] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [resolution, setResolution] = useState('1280x720');
    const [framerate, setFramerate] = useState('30');
    const [storageLocation, setStorageLocation] = useState('');
    const [diskUsage, setDiskUsage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(PLANS.PRO);
    const [backupSettings, setBackupSettings] = useState({
        enabled: false,
        location: 'default',
        lastBackupAt: null,
        retentionDays: 7
    });
    const [backingUp, setBackingUp] = useState(false);
    const [clearingData, setClearingData] = useState(false);

    const navigate = useNavigate();
    const { profile, hasPermission } = useAuth(); // NEW: Added hasPermission

    // Check if user is staff (not admin)
    const isStaff = profile?.role && profile.role !== 'ADMIN' && profile.role !== 'admin';

    useEffect(() => {
        loadSettings();
        loadCameraDevices();
        loadDiskUsage();
        loadCurrentPlan();
        loadBackupSettings();
    }, []);

    const loadSettings = async () => {
        try {
            if (window.electronAPI?.settings) {
                const camera = await window.electronAPI.settings.get('camera_device_id');
                const res = await window.electronAPI.settings.get('camera_resolution');
                const fps = await window.electronAPI.settings.get('camera_framerate');
                const storage = await window.electronAPI.settings.get('storage_location');

                setSelectedCamera(camera || 'default');
                setResolution(res || '1280x720');
                setFramerate(fps || '30');
                setStorageLocation(storage || 'default');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const loadCameraDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            setCameraDevices(videoDevices);
        } catch (error) {
            console.error('Error loading camera devices:', error);
        }
    };

    const loadDiskUsage = async () => {
        try {
            if (window.electronAPI?.system?.getDiskUsage) {
                const usage = await window.electronAPI.system.getDiskUsage();
                setDiskUsage(usage);
            }
        } catch (error) {
            console.error('Error loading disk usage:', error);
        }
    };

    const loadCurrentPlan = async () => {
        try {
            const plan = await window.electronAPI.settings.get('current_plan');
            if (plan) {
                setCurrentPlan(plan);
            }
        } catch (error) {
            console.error('Error loading plan:', error);
            setCurrentPlan(PLANS.PRO);
        }
    };

    const loadBackupSettings = async () => {
        try {
            if (window.electronAPI?.backup) {
                const result = await window.electronAPI.backup.getSettings();
                if (result.success) {
                    setBackupSettings(result.settings);
                }
            }
        } catch (error) {
            console.error('Error loading backup settings:', error);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            if (window.electronAPI?.settings) {
                await window.electronAPI.settings.set('camera_device_id', selectedCamera);
                await window.electronAPI.settings.set('camera_resolution', resolution);
                await window.electronAPI.settings.set('camera_framerate', framerate);
                await window.electronAPI.settings.set('storage_location', storageLocation);

                alert('Settings saved successfully!');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleBrowseFolder = async () => {
        alert('Folder browser will be implemented with Electron dialog');
    };

    const handleBackupNow = async () => {
        setBackingUp(true);
        try {
            const result = await window.electronAPI.backup.create();
            if (result.success) {
                alert(`Backup created successfully!\nFile: ${result.fileName}`);
                loadBackupSettings();
            } else {
                alert('Backup failed: ' + result.error);
            }
        } catch (error) {
            console.error('Backup error:', error);
            alert('Backup failed to start');
        } finally {
            setBackingUp(false);
        }
    };

    const toggleAutoBackup = async (enabled) => {
        try {
            setBackupSettings(prev => ({ ...prev, enabled }));
            await window.electronAPI.backup.updateSettings({ enabled });
        } catch (error) {
            console.error('Error updating backup settings:', error);
            setBackupSettings(prev => ({ ...prev, enabled: !enabled }));
        }
    };

    const updateRetention = async (days) => {
        try {
            const retentionDays = parseInt(days);
            setBackupSettings(prev => ({ ...prev, retentionDays }));
            await window.electronAPI.backup.updateSettings({ retentionDays });
        } catch (error) {
            console.error('Error updating retention:', error);
        }
    };

    const handleClearData = async () => {
        // First confirmation
        const firstConfirm = confirm(
            '⚠️ WARNING: Clear All Data?\n\n' +
            'This will permanently delete:\n' +
            '• All products and inventory\n' +
            '• All return records\n' +
            '• All activity logs\n' +
            '• All reconciliation data\n\n' +
            'This action CANNOT be undone!\n\n' +
            'Click OK to continue, or Cancel to abort.'
        );

        if (!firstConfirm) {
            console.log('[Clear Data] User cancelled at first confirmation');
            return;
        }

        // Second confirmation (extra safety)
        const secondConfirm = confirm(
            '🚨 FINAL CONFIRMATION\n\n' +
            'Are you ABSOLUTELY SURE you want to delete all local data?\n\n' +
            'This is your last chance to cancel.\n\n' +
            'Click OK to DELETE ALL DATA, or Cancel to abort.'
        );

        if (!secondConfirm) {
            console.log('[Clear Data] User cancelled at final confirmation');
            return;
        }

        // Proceed with deletion
        setClearingData(true);
        try {
            if (window.electronAPI?.database) {
                console.log('[Clear Data] Starting data deletion...');
                const result = await window.electronAPI.database.clearAllData();

                if (result.success) {
                    alert(
                        '✅ All data has been deleted!\n\n' +
                        'The application will now reload.'
                    );
                    // Reload the page to refresh all data
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } else {
                    alert('❌ Failed to clear data: ' + (result.error || 'Unknown error'));
                }
            } else {
                alert('❌ Database API not available. Please restart the application.');
            }
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('❌ Error clearing data: ' + error.message);
        } finally {
            setClearingData(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">Configure application preferences</p>
            </div>

            {/* Plan Information - Admin Only */}
            {!isStaff && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Crown className="w-5 h-5 text-primary" />
                                <CardTitle>Current Plan</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-base px-3 py-1">
                                {PLAN_FEATURES[currentPlan]?.name || 'Pro'}
                            </Badge>
                        </div>
                        <CardDescription>
                            {currentPlan === PLANS.STARTER
                                ? 'Perfect for small sellers and single PC setups'
                                : currentPlan === PLANS.PRO
                                    ? 'Full-featured plan for growing businesses'
                                    : 'Enterprise-grade solution with unlimited capabilities'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Included Features:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {PLAN_FEATURES[currentPlan]?.featureList?.slice(0, 6).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {currentPlan !== PLANS.ENTERPRISE && (
                            <Button
                                onClick={() => navigate('/pricing')}
                                className="w-full gap-2"
                                variant="outline"
                            >
                                View All Plans & Upgrade
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Camera Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-primary" />
                            <CardTitle>Camera Settings</CardTitle>
                        </div>
                        <CardDescription>Configure camera for packing videos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Camera Device</label>
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                value={selectedCamera}
                                onChange={(e) => setSelectedCamera(e.target.value)}
                            >
                                <option value="default">Default Camera</option>
                                {cameraDevices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Camera ${device.deviceId.substring(0, 8)}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Resolution</label>
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                            >
                                <option value="1280x720">720p (1280x720)</option>
                                <option value="1920x1080">1080p (1920x1080)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Frame Rate</label>
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                value={framerate}
                                onChange={(e) => setFramerate(e.target.value)}
                            >
                                <option value="24">24 FPS</option>
                                <option value="30">30 FPS</option>
                                <option value="60">60 FPS</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Storage Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-primary" />
                            <CardTitle>Storage Settings</CardTitle>
                        </div>
                        <CardDescription>Configure video storage location</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Storage Location</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={storageLocation === 'default' ? 'Default (AppData/InventoryAppData/videos)' : storageLocation}
                                    readOnly
                                />
                                <Button variant="outline" onClick={handleBrowseFolder}>
                                    Browse
                                </Button>
                            </div>
                        </div>

                        {diskUsage && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Videos</span>
                                    <span className="font-semibold">{formatFileSize(diskUsage.videos)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Images</span>
                                    <span className="font-semibold">{formatFileSize(diskUsage.images)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Database</span>
                                    <span className="font-semibold">{formatFileSize(diskUsage.database)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm pt-2 border-t">
                                    <span className="font-medium">Total Usage</span>
                                    <Badge variant="secondary">{formatFileSize(diskUsage.total)}</Badge>
                                </div>
                            </div>
                        )}

                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400">
                            <p><strong>Note:</strong> Videos are automatically organized by date in YYYY-MM-DD folders.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Backup & Data Settings */}
                <Card className={!hasFeature(currentPlan, 'auto_backup') ? 'opacity-90' : ''}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Save className="w-5 h-5 text-primary" />
                            <CardTitle>Backup & Data</CardTitle>
                        </div>
                        <CardDescription>Manage automated backups and data protection</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!hasFeature(currentPlan, 'auto_backup') ? (
                            <div className="text-center py-4 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Automatic daily backups are available on Pro plan.
                                </p>
                                <Button size="sm" onClick={() => navigate('/pricing')}>
                                    Upgrade to Pro
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium">Auto Daily Backup</label>
                                        <p className="text-xs text-muted-foreground">Backup database once per day</p>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={backupSettings.enabled}
                                            onChange={(e) => toggleAutoBackup(e.target.checked)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Retention Policy</label>
                                    <select
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                        value={backupSettings.retentionDays}
                                        onChange={(e) => updateRetention(e.target.value)}
                                    >
                                        <option value="3">Keep last 3 days</option>
                                        <option value="7">Keep last 7 days</option>
                                        <option value="14">Keep last 14 days</option>
                                        <option value="30">Keep last 30 days</option>
                                    </select>
                                </div>

                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-muted-foreground">Last backup:</span>
                                        <span className="text-sm font-medium">
                                            {backupSettings.lastBackupAt
                                                ? new Date(backupSettings.lastBackupAt).toLocaleString()
                                                : 'Never'}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleBackupNow}
                                        disabled={backingUp}
                                    >
                                        {backingUp ? 'Creating Backup...' : 'Backup Now'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Clear Data */}
                <Card className="border-2 border-destructive/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive" />
                            <CardTitle className="text-destructive">Clear Data</CardTitle>
                        </div>
                        <CardDescription>Clear all local database records</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
                            <p className="text-sm font-semibold text-destructive">⚠️ Danger Zone</p>
                            <p className="text-xs text-muted-foreground">
                                This will permanently delete all products, returns, activity logs, and inventory records from your local database.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                <strong>Note:</strong> This only affects local SQLite data. Your Supabase profile and license data will remain intact.
                            </p>
                        </div>

                        <div className="space-y-2 text-xs text-muted-foreground">
                            <p><strong>What will be deleted:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>All products and inventory</li>
                                <li>All return records</li>
                                <li>All activity logs</li>
                                <li>All reconciliation data</li>
                            </ul>
                        </div>

                        <div className="space-y-2 text-xs text-muted-foreground">
                            <p><strong>What will be preserved:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Your account and profile (Supabase)</li>
                                <li>Your license and plan status</li>
                                <li>Application settings</li>
                            </ul>
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleClearData}
                            disabled={clearingData || isStaff}
                            title={isStaff ? "Only administrators can clear data" : ""}
                        >
                            {isStaff ? (
                                <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Admin Only - Clear All Data
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {clearingData ? 'Clearing Data...' : 'Clear All Data'}
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground italic">
                            {isStaff ? 'Contact your administrator to clear data' : 'Requires two confirmations before deletion'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveSettings} disabled={saving}>
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </div>
    );
}
