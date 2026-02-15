import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Circle, Square, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import toast from '@/hooks/useToast';

export default function PackingCamera() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [stream, setStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [cameraError, setCameraError] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [checklistProduct, setChecklistProduct] = useState(false);
    const [checklistQuantity, setChecklistQuantity] = useState(false);
    const [checklistSealing, setChecklistSealing] = useState(false);
    const [photoBeforeSeal, setPhotoBeforeSeal] = useState(null);
    const [photoAfterSeal, setPhotoAfterSeal] = useState(null);
    const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

    const videoRef = useRef(null);
    const timerRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        loadPackingOrders();
        startCamera(); // Initialize camera on mount with saved settings
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const loadPackingOrders = async () => {
        try {
            const allOrders = await window.electronAPI.orders.getAll();
            const packingOrders = allOrders.filter(o => ['NEW', 'PACKING'].includes(o.status));
            setOrders(packingOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const startCamera = async () => {
        try {
            setCameraError('');

            // Load saved camera settings from database
            const deviceId = await window.electronAPI.settings.get('camera_device_id');
            const resolution = await window.electronAPI.settings.get('camera_resolution');
            const framerate = await window.electronAPI.settings.get('camera_framerate');

            console.log('[Camera] Settings:', { deviceId, resolution, framerate });

            const constraints = {
                video: {
                    width: { ideal: resolution ? parseInt(resolution.split('x')[0]) : 1280 },
                    height: { ideal: resolution ? parseInt(resolution.split('x')[1]) : 720 },
                    frameRate: { ideal: framerate ? parseInt(framerate) : 30 }
                },
                audio: true
            };

            // Use exact deviceId if saved
            if (deviceId) {
                constraints.video.deviceId = { exact: deviceId };
            }

            console.log('[Camera] Constraints:', constraints);

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            console.log('[Camera] Started successfully');
        } catch (error) {
            console.error('[Camera] Error:', error);

            // Fallback if selected device unavailable
            if (error.name === 'OverconstrainedError' || error.name === 'NotFoundError') {
                console.log('[Camera] Trying fallback...');
                try {
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: true
                    });
                    setStream(fallbackStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = fallbackStream;
                    }
                    setCameraError('Selected camera not found. Please reselect in Settings.');
                } catch (fallbackError) {
                    setCameraError(`Camera access failed: ${fallbackError.message} `);
                }
            } else {
                setCameraError(`Camera access failed: ${error.message} `);
            }
        }
    };

    const startRecording = () => {
        if (!stream) return;

        try {
            const chunks = [];
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
            });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {
                console.log('[Recording] Stopped, saving video...');
                setRecordedChunks(chunks);
                await saveVideo(chunks);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('[Recording] Start error:', error);
            toast.error(`Failed to start recording: ${error.message} `);
        }
    };

    const stopRecording = async () => {
        // Check if checklist is complete
        if (!checklistProduct || !checklistQuantity || !checklistSealing) {
            let message = 'Please complete all checklist items before stopping recording:\n\n';
            if (!checklistProduct) message += '• Correct product packed\n';
            if (!checklistQuantity) message += '• Correct quantity packed\n';
            if (!checklistSealing) message += '• Proper sealing done';
            toast.warning(message);
            return;
        }

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            console.log('[Recording] Stopping...');
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            mediaRecorder.stop();
            // onstop event will trigger saveVideo
        }
    };

    const capturePhoto = async (type) => {
        try {
            if (!videoRef.current) {
                toast.error('Video not available');
                return;
            }

            setIsCapturingPhoto(true);

            // Create canvas if not exists
            if (!canvasRef.current) {
                canvasRef.current = document.createElement('canvas');
            }

            const canvas = canvasRef.current;
            const video = videoRef.current;

            // Set canvas size to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current video frame to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            canvas.toBlob(async (blob) => {
                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    const buffer = new Uint8Array(arrayBuffer);

                    // Save photo via IPC
                    const result = await window.electronAPI.photos.save({
                        orderNumber: selectedOrder.order_number,
                        buffer: Array.from(buffer),
                        type: type
                    });

                    // Create preview URL
                    const previewUrl = URL.createObjectURL(blob);

                    // Update state based on type
                    if (type === 'before_seal') {
                        setPhotoBeforeSeal({ url: previewUrl, path: result.filePath });
                    } else {
                        setPhotoAfterSeal({ url: previewUrl, path: result.filePath });
                    }

                    console.log(`[Photo] Captured ${type}: `, result.filePath);
                } catch (error) {
                    console.error('[Photo] Error saving:', error);
                    toast.error(`Failed to save photo: ${error.message} `);
                } finally {
                    setIsCapturingPhoto(false);
                }
            }, 'image/jpeg', 0.9);
        } catch (error) {
            console.error('[Photo] Capture error:', error);
            toast.error(`Failed to capture photo: ${error.message} `);
            setIsCapturingPhoto(false);
        }
    };

    const saveVideo = async (chunks) => {
        try {
            console.log('[Save] Starting video save...');
            setSaveStatus('saving');
            const blob = new Blob(chunks, { type: 'video/webm' });
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            console.log('[Save] Saving video file...');
            const videoResult = await window.electronAPI.videos.save({
                orderId: selectedOrder.id,
                orderNumber: selectedOrder.order_number,
                buffer: Array.from(uint8Array),
                duration: recordingTime,
                recordedBy: user.id,
            });

            console.log('[Save] Saving packing evidence...');
            await window.electronAPI.packingEvidence.create({
                order_id: selectedOrder.id,
                video_id: videoResult.id,
                checklist_product_correct: checklistProduct,
                checklist_quantity_correct: checklistQuantity,
                checklist_sealing_done: checklistSealing,
                photo_before_seal: photoBeforeSeal?.path || null,
                photo_after_seal: photoAfterSeal?.path || null,
            });

            console.log('[Save] Updating order status to PACKED...');
            await window.electronAPI.orders.updateStatus(selectedOrder.id, 'PACKED');

            console.log('[Save] Success!');
            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('');
                setSelectedOrder(null);
                // Reset checklist and photos
                setChecklistProduct(false);
                setChecklistQuantity(false);
                setChecklistSealing(false);
                setPhotoBeforeSeal(null);
                setPhotoAfterSeal(null);
                loadPackingOrders();
            }, 2000);
        } catch (error) {
            console.error('[Save] Error:', error);
            setSaveStatus('error');
            toast.error(`Failed to save video: ${error.message} `);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Packing Camera</h1>
                <p className="text-muted-foreground">Record packing process with video evidence</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Camera Feed */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Camera Feed</CardTitle>
                            <CardDescription>
                                {selectedOrder ? `Recording for Order ${selectedOrder.order_number}` : 'Live camera preview'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                {cameraError ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                                        <div className="text-center px-4">
                                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Camera Error</p>
                                            <p className="text-sm text-red-600 dark:text-red-400">{cameraError}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Order Information Overlay */}
                                        {selectedOrder && (
                                            <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-3 rounded-lg text-sm space-y-1">
                                                <p className="font-mono font-bold">{selectedOrder.order_number}</p>
                                                <p>{new Date().toLocaleString()}</p>
                                                <p>Staff: {user?.username || 'Unknown'}</p>
                                            </div>
                                        )}
                                        {/* REC Indicator */}
                                        {isRecording && (
                                            <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold">
                                                <Circle className="w-4 h-4 fill-current animate-pulse" />
                                                REC {formatTime(recordingTime)}
                                            </div>
                                        )}
                                        {saveStatus === 'success' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                                                <div className="text-center">
                                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                                    <p className="text-green-600 dark:text-green-400 font-semibold">Video Saved Successfully!</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {selectedOrder && !cameraError && (
                                <div className="mt-6 flex gap-4 justify-center">
                                    {!isRecording ? (
                                        <Button onClick={startRecording} size="lg" className="gap-2">
                                            <Circle className="w-5 h-5" />
                                            Start Recording
                                        </Button>
                                    ) : (
                                        <Button onClick={stopRecording} size="lg" variant="destructive" className="gap-2">
                                            <Square className="w-5 h-5" />
                                            Stop Recording
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Packing Checklist */}
                            {isRecording && selectedOrder && (
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle className="text-base">Packing Checklist</CardTitle>
                                        <CardDescription>Complete all items before stopping</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={checklistProduct}
                                                    onChange={(e) => setChecklistProduct(e.target.checked)}
                                                    className="w-5 h-5 cursor-pointer"
                                                />
                                                <span className="text-sm">Correct product packed</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={checklistQuantity}
                                                    onChange={(e) => setChecklistQuantity(e.target.checked)}
                                                    className="w-5 h-5 cursor-pointer"
                                                />
                                                <span className="text-sm">Correct quantity packed</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={checklistSealing}
                                                    onChange={(e) => setChecklistSealing(e.target.checked)}
                                                    className="w-5 h-5 cursor-pointer"
                                                />
                                                <span className="text-sm">Proper sealing done</span>
                                            </label>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Photo Capture */}
                            {isRecording && selectedOrder && (
                                <div className="mt-6">
                                    <div className="flex gap-3 justify-center mb-4">
                                        <Button
                                            onClick={() => capturePhoto('before_seal')}
                                            disabled={isCapturingPhoto}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Capture Before Seal
                                        </Button>
                                        <Button
                                            onClick={() => capturePhoto('after_seal')}
                                            disabled={isCapturingPhoto}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Capture After Seal
                                        </Button>
                                    </div>
                                    {(photoBeforeSeal || photoAfterSeal) && (
                                        <div className="flex gap-4 justify-center">
                                            {photoBeforeSeal && (
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground mb-2">Before Seal</p>
                                                    <img
                                                        src={photoBeforeSeal.url}
                                                        alt="Before seal"
                                                        className="w-32 h-32 object-cover rounded border-2 border-green-500"
                                                    />
                                                </div>
                                            )}
                                            {photoAfterSeal && (
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground mb-2">After Seal</p>
                                                    <img
                                                        src={photoAfterSeal.url}
                                                        alt="After seal"
                                                        className="w-32 h-32 object-cover rounded border-2 border-green-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Order Selection */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Order</CardTitle>
                            <CardDescription>Choose an order to pack</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {orders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">No orders ready for packing</p>
                                ) : (
                                    orders.map((order) => (
                                        <button
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            disabled={isRecording}
                                            className={`w - full p - 4 rounded - lg border - 2 transition - all text - left ${selectedOrder?.id === order.id
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary/50 hover:bg-accent'
                                                } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''} `}
                                        >
                                            <p className="font-mono font-semibold text-sm mb-1">{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                                            <Badge className="mt-2 status-packing">{order.status}</Badge>
                                        </button>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
