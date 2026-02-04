import React, { useEffect, useState } from 'react';
import { Search, AlertCircle, CheckCircle, XCircle, Play, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import JSZip from 'jszip';
import { generateEvidencePDF, generateEvidenceJSON } from '@/utils/evidencePDF';
import { PLANS, hasFeature } from '@/config/plans';
import { UpgradeButton } from '@/components/UpgradePrompt';

export default function Returns() {
    const { user, activePlan } = useAuth();
    const [returns, setReturns] = useState([]);
    const [filteredReturns, setFilteredReturns] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showRestockDialog, setShowRestockDialog] = useState(false);
    const [videos, setVideos] = useState([]);
    const [restockDecision, setRestockDecision] = useState('YES');
    const [restockNotes, setRestockNotes] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [packingEvidence, setPackingEvidence] = useState(null);

    const currentPlan = activePlan?.startsWith('PRO') ? PLANS.PRO :
        activePlan === 'ENTERPRISE' ? PLANS.ENTERPRISE : PLANS.STARTER;

    useEffect(() => {
        loadReturns();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = returns.filter(r =>
                r.order_number.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredReturns(filtered);
        } else {
            setFilteredReturns(returns);
        }
    }, [searchQuery, returns]);

    const loadReturns = async () => {
        try {
            const data = await window.electronAPI.returns.getAll();
            setReturns(data);
            setFilteredReturns(data);
        } catch (error) {
            console.error('Error loading returns:', error);
        }
    };

    const viewReturnDetails = async (returnItem) => {
        try {
            setSelectedReturn(returnItem);
            const orderVideos = await window.electronAPI.videos.getByOrderId(returnItem.order_id);

            // Verify each video
            const videosWithStatus = await Promise.all(
                orderVideos.map(async (video) => {
                    const verification = await window.electronAPI.videos.verify(video.id);
                    return { ...video, verification };
                })
            );

            setVideos(videosWithStatus);

            // Load packing evidence
            const evidence = await window.electronAPI.packingEvidence.getByOrderId(returnItem.order_id);
            setPackingEvidence(evidence);

            setShowDialog(true);
        } catch (error) {
            console.error('Error loading return details:', error);
        }
    };

    const getVideoUrl = (filePath) => {
        // Convert Windows path to file:// URL
        // Replace backslashes with forward slashes and encode
        const normalizedPath = filePath.replace(/\\/g, '/');
        return `file:///${normalizedPath}`;
    };

    const getNextStatus = (currentStatus, returnType) => {
        if (returnType === 'RETURN') {
            const returnFlow = {
                'PENDING': 'APPROVED',
                'APPROVED': 'COMPLETED',
            };
            return returnFlow[currentStatus];
        } else { // RTO
            const rtoFlow = {
                'PENDING': 'INSPECTED',
                'INSPECTED': 'APPROVED',
                'APPROVED': 'COMPLETED',
            };
            return rtoFlow[currentStatus];
        }
    };

    const canReject = (status, returnType) => {
        return returnType === 'RTO' && status === 'INSPECTED';
    };

    const updateReturnStatus = async (newStatus) => {
        try {
            // Check if this is approval - need to handle inventory
            if (newStatus === 'APPROVED' && !selectedReturn.inventory_adjusted) {
                setShowRestockDialog(true);
                return;
            }

            await window.electronAPI.returns.update(selectedReturn.id, {
                status: newStatus,
            });

            // Log audit
            if (window.electronAPI?.audit) {
                await window.electronAPI.audit.addLog({
                    action: 'UPDATE_RETURN_STATUS',
                    entity_type: 'RETURN',
                    entity_id: selectedReturn.id,
                    details: JSON.stringify({
                        order_number: selectedReturn.order_number,
                        old_status: selectedReturn.status,
                        new_status: newStatus,
                    }),
                });
            }

            alert(`Status updated to ${newStatus}`);
            loadReturns();
            setShowDialog(false);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleRestockDecision = async () => {
        try {
            // Database handler automatically restores inventory atomically
            // NO manual inventory updates - prevents double counting
            await window.electronAPI.returns.update(selectedReturn.id, {
                status: 'APPROVED',
                restock_status: restockDecision,
                stock_restored: true,
                inspection_notes: restockNotes || selectedReturn.inspection_notes,
            });

            // Log approval
            if (window.electronAPI?.audit) {
                await window.electronAPI.audit.addLog({
                    action: 'RETURN_APPROVED',
                    entity_type: 'RETURN',
                    entity_id: selectedReturn.id,
                    details: JSON.stringify({
                        order_number: selectedReturn.order_number,
                        restock_decision: restockDecision,
                        notes: restockNotes,
                    }),
                });
            }

            alert('Return approved and inventory adjusted');
            setShowRestockDialog(false);
            loadReturns();
            setShowDialog(false);
        } catch (error) {
            console.error('Error processing restock:', error);
            alert(`Failed to process inventory adjustment: ${error.message}`);
        }
    };

    const handleExportEvidence = async () => {
        try {
            // Check permissions
            if (!['ADMIN', 'MANAGER'].includes(user?.role)) {
                alert('Access denied - insufficient permissions. Only ADMIN and MANAGER roles can export evidence.');
                return;
            }

            // Check if video exists
            if (!videos || videos.length === 0) {
                alert('Cannot export - no video evidence found for this order.');
                return;
            }

            setIsExporting(true);

            console.log('[Export] Starting evidence export for order:', selectedReturn.order_id);

            // Call IPC to get evidence data
            const evidenceData = await window.electronAPI.export.generateEvidence(
                selectedReturn.order_id,
                selectedReturn.id
            );

            console.log('[Export] Evidence data received');

            // Create ZIP structure
            const zip = new JSZip();
            const folderName = `ORD-${evidenceData.orderNumber}_EVIDENCE`;
            const folder = zip.folder(folderName);

            // Add video to ZIP
            const videoFolder = folder.folder('video');
            const videoBuffer = new Uint8Array(evidenceData.videoBuffer);
            videoFolder.file('packing.mp4', videoBuffer);

            console.log('[Export] Video added to ZIP');

            // Generate PDF summary
            try {
                const pdfDoc = generateEvidencePDF(evidenceData);
                const pdfBlob = pdfDoc.output('blob');
                folder.file('evidence_summary.pdf', pdfBlob);
                console.log('[Export] PDF summary generated');
            } catch (pdfError) {
                console.warn('[Export] PDF generation failed, using JSON fallback:', pdfError);
                // Fallback to JSON if PDF fails
                const jsonContent = generateEvidenceJSON(evidenceData);
                folder.file('evidence_summary.json', jsonContent);
                console.log('[Export] JSON summary generated as fallback');
            }

            // Create photos folder (placeholder for future use)
            folder.folder('photos');

            console.log('[Export] Generating ZIP file...');

            // Generate and download ZIP
            const blob = await zip.generateAsync({ type: 'blob' });

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${folderName}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('[Export] Evidence exported successfully');
            alert('Evidence exported successfully!');

        } catch (error) {
            console.error('[Export] Error exporting evidence:', error);
            alert(`Failed to export evidence: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
            'INSPECTED': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            'APPROVED': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
            'REJECTED': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
            'COMPLETED': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
        };
        return colors[status] || '';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Returns & RTO</h1>
                <p className="text-muted-foreground">Manage returns with video evidence</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search returns by order number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Evidence</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReturns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <p className="text-muted-foreground">No returns found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReturns.map((returnItem) => (
                                    <TableRow key={returnItem.id} className="cursor-pointer" onClick={() => viewReturnDetails(returnItem)}>
                                        <TableCell className="font-mono font-semibold">{returnItem.order_number}</TableCell>
                                        <TableCell>
                                            <Badge className={returnItem.return_type === 'RTO' ? 'status-rto' : 'status-return'}>
                                                {returnItem.return_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{returnItem.reason || 'N/A'}</TableCell>
                                        <TableCell>{formatDateTime(returnItem.created_at)}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(returnItem.status)}>{returnItem.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <button className="text-primary hover:underline text-sm font-medium">
                                                View Evidence
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Return Details Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Return Evidence</DialogTitle>
                    </DialogHeader>
                    {selectedReturn && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Number</p>
                                    <p className="font-mono font-semibold">{selectedReturn.order_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Return Type</p>
                                    <Badge className={selectedReturn.return_type === 'RTO' ? 'status-rto' : 'status-return'}>
                                        {selectedReturn.return_type}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Reason</p>
                                    <p>{selectedReturn.reason || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusColor(selectedReturn.status)}>{selectedReturn.status}</Badge>
                                </div>
                            </div>

                            {selectedReturn.inspection_notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Inspection Notes</p>
                                    <div className="p-4 rounded-lg bg-secondary">
                                        <p>{selectedReturn.inspection_notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Status Workflow */}
                            {selectedReturn.status !== 'COMPLETED' && selectedReturn.status !== 'REJECTED' && (
                                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-sm font-medium mb-3">Update Status</p>
                                    <div className="flex gap-2">
                                        {getNextStatus(selectedReturn.status, selectedReturn.return_type) && (
                                            <Button onClick={() => updateReturnStatus(getNextStatus(selectedReturn.status, selectedReturn.return_type))}>
                                                Move to {getNextStatus(selectedReturn.status, selectedReturn.return_type)}
                                            </Button>
                                        )}
                                        {canReject(selectedReturn.status, selectedReturn.return_type) && (
                                            <Button variant="destructive" onClick={() => updateReturnStatus('REJECTED')}>
                                                Reject
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {selectedReturn.return_type === 'RETURN'
                                            ? 'Workflow: PENDING → APPROVED → COMPLETED'
                                            : 'Workflow: PENDING → INSPECTED → APPROVED/REJECTED → COMPLETED'}
                                    </p>
                                </div>
                            )}

                            {/* Packing Checklist */}
                            {packingEvidence && (
                                <div className="p-4 rounded-lg bg-secondary/50 mb-6">
                                    <h4 className="font-semibold mb-3">Packing Checklist</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            {packingEvidence.checklist_product_correct ?
                                                <CheckCircle className="w-4 h-4 text-green-500" /> :
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            }
                                            <span>Correct product packed</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {packingEvidence.checklist_quantity_correct ?
                                                <CheckCircle className="w-4 h-4 text-green-500" /> :
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            }
                                            <span>Correct quantity packed</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {packingEvidence.checklist_sealing_done ?
                                                <CheckCircle className="w-4 h-4 text-green-500" /> :
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            }
                                            <span>Proper sealing done</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Packing Photos */}
                            {packingEvidence && (packingEvidence.photo_before_seal || packingEvidence.photo_after_seal) && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3">Packing Photos</h4>
                                    {console.log('[Photos] Before:', packingEvidence.photo_before_seal, 'After:', packingEvidence.photo_after_seal)}
                                    <div className="flex gap-4">
                                        {packingEvidence.photo_before_seal && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">Before Seal</p>
                                                <img
                                                    src={`file:///${packingEvidence.photo_before_seal.replace(/\\/g, '/')}`}
                                                    alt="Before seal"
                                                    className="w-48 h-48 object-cover rounded border"
                                                    onError={(e) => {
                                                        console.error('[Photo] Before seal error:', packingEvidence.photo_before_seal);
                                                        console.error('[Photo] URL:', e.target.src);
                                                    }}
                                                    onLoad={() => console.log('[Photo] Before seal loaded')}
                                                />
                                            </div>
                                        )}
                                        {packingEvidence.photo_after_seal && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">After Seal</p>
                                                <img
                                                    src={`file:///${packingEvidence.photo_after_seal.replace(/\\/g, '/')}`}
                                                    alt="After seal"
                                                    className="w-48 h-48 object-cover rounded border"
                                                    onError={(e) => {
                                                        console.error('[Photo] After seal error:', packingEvidence.photo_after_seal);
                                                        console.error('[Photo] URL:', e.target.src);
                                                    }}
                                                    onLoad={() => console.log('[Photo] After seal loaded')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">Video Evidence</h3>
                                    {['ADMIN', 'MANAGER'].includes(user?.role) && videos.length > 0 && (
                                        hasFeature(currentPlan, 'evidence_export') ? (
                                            <Button
                                                onClick={handleExportEvidence}
                                                disabled={isExporting}
                                                className="gap-2"
                                                size="sm"
                                            >
                                                <Download className="w-4 h-4" />
                                                {isExporting ? 'Exporting...' : 'Export Evidence'}
                                            </Button>
                                        ) : (
                                            <UpgradeButton feature="Evidence Export" requiredPlan="PRO">
                                                <Download className="w-4 h-4" />
                                                Export Evidence
                                            </UpgradeButton>
                                        )
                                    )}
                                </div>
                                {videos.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">No videos found for this order</p>
                                ) : (
                                    <div className="space-y-6">
                                        {videos.map((video) => (
                                            <Card key={video.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle className="text-base">
                                                                Recorded: {formatDateTime(video.recorded_at)}
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')} •
                                                                Size: {(video.file_size / 1024 / 1024).toFixed(2)} MB
                                                            </CardDescription>
                                                        </div>
                                                        <div>
                                                            {video.verification?.valid ? (
                                                                <div className="flex items-center gap-2 text-green-500">
                                                                    <CheckCircle className="w-5 h-5" />
                                                                    <span className="font-semibold">Valid</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-red-500">
                                                                    <XCircle className="w-5 h-5" />
                                                                    <span className="font-semibold">Invalid</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {/* Embedded Video Player */}
                                                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                                            {video.verification?.valid ? (
                                                                <video
                                                                    src={getVideoUrl(video.file_path)}
                                                                    controls
                                                                    className="w-full h-full"
                                                                    preload="metadata"
                                                                    onError={(e) => {
                                                                        console.error('[Video] Load error:', e.target.error, 'Path:', video.file_path);
                                                                        console.error('[Video] URL:', getVideoUrl(video.file_path));
                                                                    }}
                                                                    onLoadedMetadata={(e) => {
                                                                        console.log('[Video] Metadata loaded:', e.target.duration, 'seconds');
                                                                    }}
                                                                    onCanPlay={() => {
                                                                        console.log('[Video] Can play');
                                                                    }}
                                                                >
                                                                    Your browser does not support video playback.
                                                                </video>
                                                            ) : (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                                                                    <div className="text-center px-4">
                                                                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                                                        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                                                                            Video Playback Disabled
                                                                        </p>
                                                                        <p className="text-sm text-red-600 dark:text-red-400">
                                                                            This video has been tampered with and cannot be played
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Video Metadata */}
                                                        <div className="space-y-3">
                                                            <div className="p-3 rounded-lg bg-secondary/50 font-mono text-xs">
                                                                <p className="text-muted-foreground mb-1">File Hash (SHA-256):</p>
                                                                <p className="break-all">{video.file_hash}</p>
                                                            </div>

                                                            {!video.verification?.valid && (
                                                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                                                                    <div className="flex items-start gap-2">
                                                                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="font-semibold">Tamper Detected</p>
                                                                            <p className="text-sm mt-1">{video.verification?.reason}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <details className="text-sm">
                                                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                                    Show file path
                                                                </summary>
                                                                <p className="mt-2 p-2 rounded bg-secondary font-mono text-xs break-all">
                                                                    {video.file_path}
                                                                </p>
                                                            </details>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Restock Decision Dialog */}
            <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Inventory Adjustment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            This return is being approved. Do you want to restock the items to inventory?
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Restock Decision *</label>
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                value={restockDecision}
                                onChange={(e) => setRestockDecision(e.target.value)}
                            >
                                <option value="YES">Yes - Add items back to inventory</option>
                                <option value="NO">No - Mark as damaged/lost</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <textarea
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={restockNotes}
                                onChange={(e) => setRestockNotes(e.target.value)}
                                placeholder="Optional notes about the decision..."
                            />
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400">
                            <p><strong>Note:</strong> This action will be logged in the audit trail and cannot be undone.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRestockDialog(false)}>Cancel</Button>
                        <Button onClick={handleRestockDecision}>Confirm & Approve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
