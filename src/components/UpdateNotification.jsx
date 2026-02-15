import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UpdateNotification() {
    const [updateInfo, setUpdateInfo] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Listen for update available
        if (window.electronAPI?.updates) {
            window.electronAPI.updates.onUpdateAvailable((info) => {
                console.log('[UpdateNotification] Update available:', info);
                setUpdateInfo(info);
                setIsDownloading(false);
                setError(null);
            });

            window.electronAPI.updates.onUpdateError((err) => {
                console.error('[UpdateNotification] Update error:', err);
                setError(err);
                setIsDownloading(false);
            });
        }

        return () => {
            if (window.electronAPI?.updates) {
                window.electronAPI.updates.removeUpdateListener();
            }
        };
    }, []);

    const handleDownload = () => {
        setIsDownloading(true);
        setError(null);
        window.electronAPI.updates.downloadUpdate();
    };

    const handleInstall = () => {
        window.electronAPI.updates.installUpdate();
    };

    const handleDismiss = () => {
        setUpdateInfo(null);
        setError(null);
    };

    if (!updateInfo && !error) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-4 right-4 z-50 max-w-md"
            >
                <Card className="border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                {error ? (
                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                ) : (
                                    <Download className="w-5 h-5 text-primary" />
                                )}
                                <div>
                                    <CardTitle className="text-lg">
                                        {error ? 'Update Error' : 'Update Available'}
                                    </CardTitle>
                                    {updateInfo && (
                                        <CardDescription>
                                            Version {updateInfo.version} is ready
                                        </CardDescription>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1"
                                onClick={handleDismiss}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {error ? (
                            <p className="text-sm text-destructive">
                                Failed to download update. Please try again later.
                            </p>
                        ) : updateInfo ? (
                            <>
                                {updateInfo.releaseName && (
                                    <p className="text-sm font-medium">{updateInfo.releaseName}</p>
                                )}
                                {updateInfo.releaseNotes && (
                                    <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                                        <p className="whitespace-pre-wrap">{updateInfo.releaseNotes}</p>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    {isDownloading ? (
                                        <Button disabled className="flex-1">
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Downloading...
                                        </Button>
                                    ) : (
                                        <>
                                            <Button onClick={handleDownload} className="flex-1">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download & Install
                                            </Button>
                                            <Button variant="outline" onClick={handleDismiss}>
                                                Later
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
