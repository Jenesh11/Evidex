import React, { useEffect, useState } from 'react';
import { Search, AlertCircle, CheckCircle, XCircle, Play, Download, Lock, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import JSZip from 'jszip';
import { generateEvidencePDF, generateEvidenceJSON } from '@/utils/evidencePDF';
import { PLANS, hasFeature } from '@/config/plans';
import { UpgradeButton } from '@/components/UpgradePrompt';
import toast from '@/hooks/useToast';

export default function Returns() {
    const { user, profile, effectivePlan } = useAuth();
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
    const [showExportSuccess, setShowExportSuccess] = useState(false);
    const [packingEvidence, setPackingEvidence] = useState(null);

    const currentPlan = effectivePlan?.startsWith('PRO') ? PLANS.PRO :
        effectivePlan === 'ENTERPRISE' ? PLANS.ENTERPRISE : PLANS.STARTER;

    // Helper to check role permissions
    const hasRole = (allowedRoles) => {
        const role = profile?.role || user?.role; // Fallback to user role if profile not loaded
        return allowedRoles.includes(role);
    };

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

            toast.success(`Status updated to ${newStatus}`);
            loadReturns();
            setShowDialog(false);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
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

            toast.success('Return approved and inventory adjusted');
            setShowRestockDialog(false);
            loadReturns();
            setShowDialog(false);
        } catch (error) {
            console.error('Error processing restock:', error);
            toast.error(`Failed to process inventory adjustment: ${error.message}`);
        }
    };

    const handleExportEvidence = async () => {
        try {
            // Check permissions
            if (!hasRole(['ADMIN', 'MANAGER'])) {
                toast.error('Access denied - insufficient permissions. Only ADMIN and MANAGER roles can export evidence.');
                return;
            }

            // Check if video exists
            if (!videos || videos.length === 0) {
                toast.warning('Cannot export - no video evidence found for this order.');
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
            setShowExportSuccess(true);
            toast.success('Evidence exported successfully!');

        } catch (error) {
            console.error('[Export] Error exporting evidence:', error);
            toast.error(`Failed to export evidence: ${error.message}`);
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
                                    <TableRow key={returnItem.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => viewReturnDetails(returnItem)}>
                                        <TableCell className="font-mono font-semibold text-primary">{returnItem.order_number}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={returnItem.return_type === 'RTO' ? 'status-rto' : 'status-return'}>
                                                {returnItem.return_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{returnItem.reason || 'N/A'}</TableCell>
                                        <TableCell>{formatDateTime(returnItem.created_at)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(returnItem.status)}>{returnItem.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-2">
                                                <Play className="w-4 h-4" />
                                                View Evidence
                                            </Button>
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
                        <div className="space-y-8 py-4">
                            {/* Order Info Grid */}
                            <div className="grid grid-cols-4 gap-6 p-6 rounded-xl bg-muted/40 border">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
                                    <p className="font-mono font-bold text-lg">{selectedReturn.order_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Return Type</p>
                                    <Badge variant="outline" className={selectedReturn.return_type === 'RTO' ? 'status-rto' : 'status-return'}>
                                        {selectedReturn.return_type}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Reason</p>
                                    <p className="font-medium">{selectedReturn.reason || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                                    <Badge variant="outline" className={getStatusColor(selectedReturn.status)}>{selectedReturn.status}</Badge>
                                </div>
                            </div>

                            {/* Status Workflow Actions */}
                            {selectedReturn.status !== 'COMPLETED' && selectedReturn.status !== 'REJECTED' && (
                                <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base font-semibold mb-1">Update Status</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Current Stage: <span className="font-medium text-foreground">{selectedReturn.status}</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            {getNextStatus(selectedReturn.status, selectedReturn.return_type) && (
                                                <Button
                                                    onClick={() => updateReturnStatus(getNextStatus(selectedReturn.status, selectedReturn.return_type))}
                                                    className="gap-2"
                                                >
                                                    Move to {getNextStatus(selectedReturn.status, selectedReturn.return_type)}
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {canReject(selectedReturn.status, selectedReturn.return_type) && (
                                                <Button variant="destructive" onClick={() => updateReturnStatus('REJECTED')}>
                                                    Reject Return
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Inspection Notes */}
                            {selectedReturn.inspection_notes && (
                                <div>
                                    <h4 className="font-semibold mb-3">Inspection Notes</h4>
                                    <div className="p-4 rounded-lg bg-secondary/50 text-sm">
                                        <p>{selectedReturn.inspection_notes}</p>
                                    </div>
                                </div>
                            )}

                            <div className="border-t pt-6"></div>

                            {/* Video Evidence Section */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Play className="w-5 h-5 text-primary" />
                                            Video Evidence
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">Review packing footage for verification</p>
                                    </div>

                                    {/* EXPORT BUTTON LOGIC START */}
                                    {videos.length > 0 && (
                                        hasFeature(currentPlan, 'evidence_export') ? (
                                            /* Pro Plan Check */
                                            hasRole(['ADMIN', 'MANAGER']) ? (
                                                /* Admin/Manager: Enabled */
                                                <Button
                                                    onClick={handleExportEvidence}
                                                    disabled={isExporting}
                                                    className="gap-2"
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    {isExporting ? 'Exporting...' : 'Export Evidence'}
                                                </Button>
                                            ) : (
                                                /* Staff: Disabled (Locked) */
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="cursor-not-allowed">
                                                                <Button
                                                                    disabled
                                                                    className="gap-2 opacity-70"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                >
                                                                    <Lock className="w-3 h-3" />
                                                                    Export Evidence
                                                                </Button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Restricted to Admin/Manager accounts</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )
                                        ) : (
                                            /* Non-Pro Plan: Upgrade */
                                            <UpgradeButton feature="Evidence Export" requiredPlan="PRO">
                                                <Download className="w-4 h-4" />
                                                Export Evidence
                                            </UpgradeButton>
                                        )
                                    )}
                                    {/* EXPORT BUTTON LOGIC END */}
                                </div>

                                {videos.length === 0 ? (
                                    <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                                        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground">No video evidence found for this order</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {videos.map((video) => (
                                            <Card key={video.id} className="overflow-hidden border-2 border-border/50">
                                                <div className="grid md:grid-cols-3">
                                                    {/* Video Player Column */}
                                                    <div className="md:col-span-2 bg-black relative aspect-video group">
                                                        {video.verification?.valid ? (
                                                            <video
                                                                src={getVideoUrl(video.file_path)}
                                                                controls
                                                                className="w-full h-full object-contain"
                                                                preload="metadata"
                                                            >
                                                                Your browser does not support video playback.
                                                            </video>
                                                        ) : (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-sm p-6 text-center">
                                                                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                                                                <h4 className="text-lg font-bold text-red-500 mb-1">Playback Disabled</h4>
                                                                <p className="text-red-400 text-sm">Security verification failed. This video may have been tempered with.</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Metadata Column */}
                                                    <div className="p-6 bg-muted/10 flex flex-col justify-between">
                                                        <div className="space-y-6">
                                                            <div>
                                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Recorded At</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                                    <span className="font-mono font-medium">{formatDateTime(video.recorded_at)}</span>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Details</p>
                                                                <div className="space-y-1 text-sm">
                                                                    <p>Duration: <span className="text-foreground font-mono">{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span></p>
                                                                    <p>Size: <span className="text-foreground font-mono">{(video.file_size / 1024 / 1024).toFixed(2)} MB</span></p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Integrity Status</p>
                                                                {video.verification?.valid ? (
                                                                    <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        <span className="text-sm font-semibold">Verified Valid</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                                                                        <XCircle className="w-4 h-4" />
                                                                        <span className="text-sm font-semibold">Verification Failed</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="pt-6 border-t mt-auto">
                                                            <div className="bg-background rounded p-3 text-xs font-mono text-muted-foreground break-all border overflow-hidden">
                                                                <span className="opacity-50 select-none mr-2">SHA-256:</span>
                                                                {video.file_hash?.substring(0, 16)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Packing Checklist Summary */}
                            {packingEvidence && (
                                <div className="mt-8 pt-8 border-t">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        Packing Checklist Reference
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className={`p-4 rounded-lg border ${packingEvidence.checklist_product_correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                            <div className="flex items-center gap-3">
                                                {packingEvidence.checklist_product_correct ?
                                                    <CheckCircle className="w-5 h-5 text-green-500" /> :
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                }
                                                <span className="text-sm font-medium">Product Correct</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg border ${packingEvidence.checklist_quantity_correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                            <div className="flex items-center gap-3">
                                                {packingEvidence.checklist_quantity_correct ?
                                                    <CheckCircle className="w-5 h-5 text-green-500" /> :
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                }
                                                <span className="text-sm font-medium">Quantity Correct</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg border ${packingEvidence.checklist_sealing_done ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                            <div className="flex items-center gap-3">
                                                {packingEvidence.checklist_sealing_done ?
                                                    <CheckCircle className="w-5 h-5 text-green-500" /> :
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                }
                                                <span className="text-sm font-medium">Sealing Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
            {/* Export Success Dialog */}
            <Dialog open={showExportSuccess} onOpenChange={setShowExportSuccess}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center flex flex-col items-center gap-4 py-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <span className="text-xl">Evidence Exported!</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center pb-6 text-muted-foreground px-4">
                        The evidence package has been successfully compiled and downloaded to your computer.
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button onClick={() => setShowExportSuccess(false)} className="w-full sm:w-auto min-w-[150px]">
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
