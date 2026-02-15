import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Camera, HardDrive, Save, Crown, ArrowRight, Trash2, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/utils';
import { PLANS, PLAN_FEATURES, hasFeature } from '@/config/plans';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import toast from '@/hooks/useToast';

const ProgressBar = ({ value, max = 100, className, colorClass = "bg-primary" }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className={`h-2 w-full bg-secondary/50 rounded-full overflow-hidden ${className}`}>
            <div
                className={`h-full ${colorClass} transition-all duration-500 ease-in-out`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

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
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const navigate = useNavigate();
    const { profile, hasPermission, effectivePlan, trialDaysRemaining } = useAuth();

    // Check if user is staff (not admin)
    const isStaff = profile?.role && profile.role !== 'ADMIN' && profile.role !== 'admin';

    // Block navigation when there are unsaved changes
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        loadSettings();
        loadCameraDevices();
        loadDiskUsage();
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

    // Warn user about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            if (window.electronAPI?.settings) {
                await window.electronAPI.settings.set('camera_device_id', selectedCamera);
                await window.electronAPI.settings.set('camera_resolution', resolution);
                await window.electronAPI.settings.set('camera_framerate', framerate);
                await window.electronAPI.settings.set('storage_location', storageLocation);

                setHasUnsavedChanges(false); // Reset after successful save
                toast.success('Settings saved successfully!');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleBrowseFolder = async () => {
        try {
            if (window.electronAPI?.files?.selectDirectory) {
                const path = await window.electronAPI.files.selectDirectory();
                if (path) {
                    setStorageLocation(path);
                    setHasUnsavedChanges(true);
                }
            } else {
                toast.error('Directory selection not supported in this version');
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
            toast.error('Failed to select folder');
        }
    };

    const handleBackupNow = async () => {
        setBackingUp(true);
        try {
            const result = await window.electronAPI.backup.create();
            if (result.success) {
                toast.success(`Backup created successfully! File: ${result.fileName}`);
                loadBackupSettings();
            } else {
                toast.error('Backup failed: ' + result.error);
            }
        } catch (error) {
            console.error('Backup error:', error);
            toast.error('Backup failed to start');
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
                    toast.error('Failed to clear data: ' + (result.error || 'Unknown error'));
                }
            } else {
                toast.error('Database API not available. Please restart the application.');
            }
        } catch (error) {
            console.error('Error clearing data:', error);
            toast.error('Error clearing data: ' + error.message);
        } finally {
            setClearingData(false);
        }
    };

    return (
        <>
            {/* Unsaved Changes Confirmation Dialog */}
            <Dialog open={blocker.state === 'blocked'} onOpenChange={() => { }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. Do you want to save them before leaving?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setHasUnsavedChanges(false);
                                blocker.proceed();
                            }}
                        >
                            Discard Changes
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => blocker.reset()}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                await handleSaveSettings();
                                blocker.proceed();
                            }}
                        >
                            Save & Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-8 pb-24">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-muted-foreground">Manage your application preferences, storage, and data.</p>
                </div>

                {/* Plan Information - Admin Only */}
                {!isStaff && (
                    <Card className="border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-primary" />
                                    <CardTitle>Current Plan</CardTitle>
                                </div>
                                <Badge variant="default" className="bg-primary hover:bg-primary/90">
                                    {effectivePlan}
                                </Badge>
                            </div>
                            <CardDescription>
                                {effectivePlan === PLANS.STARTER
                                    ? 'Perfect for small sellers and single PC setups'
                                    : effectivePlan === PLANS.PRO
                                        ? 'Full-featured plan for growing businesses'
                                        : 'Enterprise-grade solution with unlimited capabilities'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Included Features:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {PLAN_FEATURES[effectivePlan]?.featureList?.slice(0, 6).map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {effectivePlan !== PLANS.ENTERPRISE && (
                                <Button
                                    onClick={() => navigate('/pricing')}
                                    className="w-full sm:w-auto gap-2"
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
                    <Card className="hover:shadow-md transition-all duration-200">
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
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={selectedCamera}
                                    onChange={(e) => { setSelectedCamera(e.target.value); setHasUnsavedChanges(true); }}
                                >
                                    <option value="default">Default Camera</option>
                                    {cameraDevices.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Camera ${device.deviceId.substring(0, 8)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Resolution</label>
                                    <select
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={resolution}
                                        onChange={(e) => { setResolution(e.target.value); setHasUnsavedChanges(true); }}
                                    >
                                        <option value="1280x720">720p (HD)</option>
                                        <option value="1920x1080">1080p (FHD)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Frame Rate</label>
                                    <select
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={framerate}
                                        onChange={(e) => { setFramerate(e.target.value); setHasUnsavedChanges(true); }}
                                    >
                                        <option value="24">24 FPS</option>
                                        <option value="30">30 FPS</option>
                                        <option value="60">60 FPS</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Storage Settings */}
                    <Card className="hover:shadow-md transition-all duration-200">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-primary" />
                                <CardTitle>Storage Settings</CardTitle>
                            </div>
                            <CardDescription>Manage storage space and location</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Storage Location</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            className="w-full h-10 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm pr-10"
                                            value={storageLocation === 'default' ? 'Default (AppData/InventoryAppData/videos)' : storageLocation}
                                            readOnly
                                        />
                                        <div className="absolute right-3 top-2.5 text-muted-foreground pointer-events-none">
                                            <HardDrive className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <Button variant="outline" onClick={handleBrowseFolder} className="shrink-0">
                                        Browse Path
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground ml-1">
                                    New videos will be saved to this folder. Database remains in AppData.
                                </p>
                            </div>

                            {diskUsage && (
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>System Drive Usage ({Math.round(diskUsage.percentUsed)}%)</span>
                                            <span className="text-muted-foreground">{formatFileSize(diskUsage.used)} used of {formatFileSize(diskUsage.size)}</span>
                                        </div>
                                        <ProgressBar value={diskUsage.percentUsed} colorClass={diskUsage.percentUsed > 90 ? "bg-destructive" : "bg-primary"} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        <div className="p-2 rounded bg-muted/30 text-center">
                                            <div className="text-xs text-muted-foreground mb-1">Videos</div>
                                            <div className="font-semibold text-sm">{formatFileSize(diskUsage.videos)}</div>
                                        </div>
                                        <div className="p-2 rounded bg-muted/30 text-center">
                                            <div className="text-xs text-muted-foreground mb-1">Images</div>
                                            <div className="font-semibold text-sm">{formatFileSize(diskUsage.images)}</div>
                                        </div>
                                        <div className="p-2 rounded bg-muted/30 text-center">
                                            <div className="text-xs text-muted-foreground mb-1">Database</div>
                                            <div className="font-semibold text-sm">{formatFileSize(diskUsage.database)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Backup Settings - Full Width */}
                <Card className={`hover:shadow-md transition-all duration-200 ${!hasFeature(currentPlan, 'auto_backup') ? 'opacity-90' : ''}`}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Save className="w-5 h-5 text-primary" />
                            <CardTitle>Backup & Restore</CardTitle>
                        </div>
                        <CardDescription>Manage automated database backups and retention policies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!hasFeature(currentPlan, 'auto_backup') ? (
                            <div className="flex flex-col items-center justify-center py-6 bg-muted/30 rounded-lg border border-dashed">
                                <h3 className="font-semibold mb-2">Automated Backups are Pro Feature</h3>
                                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                                    Upgrade to Pro plan to enable automatic daily backups and ensure your business data is never lost.
                                </p>
                                <Button size="sm" onClick={() => navigate('/pricing')}>
                                    Upgrade to Pro
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                        <div className="space-y-0.5">
                                            <label className="text-base font-medium">Auto Daily Backup</label>
                                            <p className="text-xs text-muted-foreground">Runs automatically at 00:00 daily</p>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                checked={backupSettings.enabled}
                                                onChange={(e) => toggleAutoBackup(e.target.checked)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Retention Policy</label>
                                        <select
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            value={backupSettings.retentionDays}
                                            onChange={(e) => updateRetention(e.target.value)}
                                        >
                                            <option value="3">Keep last 3 days</option>
                                            <option value="7">Keep last 7 days</option>
                                            <option value="14">Keep last 14 days</option>
                                            <option value="30">Keep last 30 days</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between space-y-4">
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <div className={`w-2 h-2 rounded-full ${backupSettings.lastBackupAt ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            Last Successful Backup
                                        </div>
                                        <div className="text-lg font-medium">
                                            {backupSettings.lastBackupAt
                                                ? new Date(backupSettings.lastBackupAt).toLocaleString()
                                                : 'No backups yet'}
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full mt-auto"
                                        onClick={handleBackupNow}
                                        disabled={backingUp}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {backingUp ? 'Creating Backup...' : 'Trigger Backup Now'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <div className="pt-8 mt-8 border-t">
                    <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Danger Zone
                    </h3>
                    <Card className="border-destructive/30 bg-destructive/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-destructive/30">
                                <div className="p-6 md:col-span-2 space-y-3">
                                    <h4 className="font-semibold text-destructive">Clear All Local Data</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently removes all products, returns, and inventory logs from the local database.
                                        This action is irreversible but does not affect your cloud account status or license.
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                        <ul className="list-disc list-inside space-y-1 opacity-80">
                                            <li>Resets inventory to zero</li>
                                            <li>Deletes all order history</li>
                                            <li>Clears all activity logs</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col items-center justify-center bg-destructive/10">
                                    <Button
                                        variant="destructive"
                                        className="w-full max-w-[200px]"
                                        onClick={handleClearData}
                                        disabled={clearingData || isStaff}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {clearingData ? 'Deleting...' : 'Clear All Data'}
                                    </Button>
                                    {isStaff && (
                                        <p className="text-xs text-center mt-2 text-destructive font-medium">
                                            <Lock className="w-3 h-3 inline mr-1" />
                                            Admin access required
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Floating Save Button */}
            {hasUnsavedChanges && (
                <div className="fixed bottom-6 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <Button
                        size="lg"
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary-foreground/20"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            )}
        </>
    );
}
