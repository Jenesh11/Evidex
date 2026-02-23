import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Eye, RotateCcw, PackageX,
    Check, Clock, Package, Truck, CheckCircle2,
    Calendar, CreditCard, User, Mail, Phone,
    ArrowRight, ChevronRight, Hash, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from '@/hooks/useToast';
import { formatCurrency, formatDateTime, getStatusColor, getStatusLabel, generateOrderNumber } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Status Workflow Definition
const STATUS_STEPS = [
    { id: 'NEW', label: 'Order Placed', icon: Clock },
    { id: 'PACKING', label: 'Processing', icon: Package },
    { id: 'PACKED', label: 'Packed', icon: CheckCircle2 },
    { id: 'SHIPPED', label: 'Shipped', icon: Truck },
    { id: 'DELIVERED', label: 'Delivered', icon: Check }
];

const StatusTimeline = ({ currentStatus, onUpdateStatus }) => {
    const currentIndex = STATUS_STEPS.findIndex(s => s.id === currentStatus);

    return (
        <div className="w-full py-10 px-8">
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-secondary rounded-full -z-10" />

                {/* Active Progress Bar */}
                <motion.div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary rounded-full -z-10"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const isFuture = index > currentIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative group">
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => onUpdateStatus(step.id)}
                                            disabled={isCompleted && !isCurrent} // Allow clicking future steps or current step
                                            className={`
                                                relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background
                                                ${isCompleted ? 'border-primary text-primary' : 'border-muted-foreground/30 text-muted-foreground'}
                                                ${isCurrent ? 'ring-4 ring-primary/20 scale-110 shadow-lg shadow-primary/20' : ''}
                                                ${!isCompleted ? 'hover:border-primary/50 hover:text-primary/70 hover:scale-105' : ''}
                                            `}
                                        >
                                            <Icon className={`w-5 h-5 ${isCompleted ? 'fill-primary/10' : ''}`} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="font-medium" sideOffset={10}>
                                        <p>{isCurrent ? 'Current Status' : `Mark as ${step.label}`}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <span className={`
                                text-sm font-medium absolute -bottom-10 whitespace-nowrap transition-colors duration-300
                                ${isCurrent ? 'text-primary font-bold scale-110' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                            `}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [returnType, setReturnType] = useState('RETURN'); // 'RETURN' or 'RTO'
    const [returnReason, setReturnReason] = useState('');
    const [returnNotes, setReturnNotes] = useState('');
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        order_number: generateOrderNumber(),
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        notes: '',
        items: [],
    });

    useEffect(() => {
        loadOrders();
        loadProducts();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = orders.filter(o =>
                o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders);
        }
    }, [searchQuery, orders]);

    const loadOrders = async () => {
        try {
            const data = await window.electronAPI.orders.getAll();
            setOrders(data);
            setFilteredOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await window.electronAPI.products.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare items with correct number types
            const preparedItems = formData.items.map(item => ({
                ...item,
                quantity: parseInt(item.quantity) || 0,
                price: parseFloat(item.price) || 0
            }));

            const total = preparedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            await window.electronAPI.orders.create({
                ...formData,
                items: preparedItems,
                total_amount: total,
                status: 'NEW',
            });
            loadOrders();
            setShowDialog(false);
            resetForm();
            toast.success('Order created successfully!');
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Failed to create order');
        }
    };

    const addItem = () => {
        if (products.length === 0) return;
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: products[0].id, quantity: 1, price: products[0].price }],
        });
    };

    const removeItem = (index) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                newItems[index].price = product.price;
            }
        }
        setFormData({ ...formData, items: newItems });
    };

    const resetForm = () => {
        setFormData({
            order_number: generateOrderNumber(),
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            notes: '',
            items: [],
        });
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const order = await window.electronAPI.orders.getById(orderId);
            setSelectedOrder(order);
            setShowDetailDialog(true);
        } catch (error) {
            console.error('Error loading order details:', error);
        }
    };

    const updateOrderStatus = async (statusId) => {
        if (!selectedOrder) return;
        try {
            await window.electronAPI.orders.updateStatus(selectedOrder.id, statusId);
            const updated = await window.electronAPI.orders.getById(selectedOrder.id);
            setSelectedOrder(updated);
            loadOrders();
            toast.success(`Order status updated to ${getStatusLabel(statusId)}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const openReturnDialog = (type) => {
        setReturnType(type);
        setReturnReason('');
        setReturnNotes('');
        setShowReturnDialog(true);
    };

    const handleMarkAsReturn = async () => {
        if (!returnReason) {
            toast.warning('Please select a reason');
            return;
        }

        try {
            // Create return record with auto-linked video
            await window.electronAPI.returns.create({
                order_id: selectedOrder.id,
                return_type: returnType,
                reason: returnReason,
                inspection_notes: returnNotes,
                status: 'PENDING',
            });

            // Update order status
            await window.electronAPI.orders.updateStatus(selectedOrder.id, returnType);

            // Log audit
            if (window.electronAPI?.audit) {
                await window.electronAPI.audit.addLog({
                    action: `MARK_AS_${returnType}`,
                    entity_type: 'ORDER',
                    entity_id: selectedOrder.id,
                    details: JSON.stringify({
                        order_number: selectedOrder.order_number,
                        reason: returnReason,
                        notes: returnNotes,
                    }),
                });
            }

            toast.success(`Order marked as ${returnType} successfully!`);
            setShowReturnDialog(false);
            setShowDetailDialog(false);
            loadOrders();
        } catch (error) {
            console.error('Error marking as return:', error);
            toast.error('Failed to mark as return');
        }
    };

    const returnReasons = [
        'Customer requested return',
        'Damaged product',
        'Wrong item shipped',
        'Quality issues',
        'Customer not available',
        'Address incorrect',
        'Other',
    ];

    return (
        <div className="space-y-8 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground dark:text-white font-display">Orders</h1>
                    <p className="text-muted-foreground text-lg italic">Track and manage customer transactions with precision</p>
                </div>
                <Button size="lg" onClick={() => { resetForm(); setShowDialog(true); }} className="btn-pro-primary h-12 px-8">
                    <Plus className="w-5 h-5 mr-2" />
                    New Order
                </Button>
            </div>

            <Card className="border-border/50 dark:border-white/5 bg-card/30 backdrop-blur-md shadow-sm overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
                            <Input
                                placeholder="Search orders by number, customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 text-foreground dark:text-white focus:border-primary/50 focus:ring-primary/20 rounded-2xl text-lg px-6"
                            />
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-border/50 dark:border-white/5 overflow-hidden bg-background/30 dark:bg-white/[0.02]">
                        <Table>
                            <TableHeader className="bg-accent/50 dark:bg-white/5">
                                <TableRow className="hover:bg-transparent border-border/50 dark:border-white/5 px-4 h-16">
                                    <TableHead className="w-[200px] text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px] pl-8">Order ID</TableHead>
                                    <TableHead className="text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
                                    <TableHead className="text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Date & Time</TableHead>
                                    <TableHead className="text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Total Amount</TableHead>
                                    <TableHead className="w-[180px] text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Current Status</TableHead>
                                    <TableHead className="w-[100px] text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px] pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Search className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <p className="text-muted-foreground font-medium">No orders found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order.id} className="group hover:bg-accent/40 dark:hover:bg-muted/40 transition-colors cursor-pointer border-border/50 dark:border-white/5" onClick={() => viewOrderDetails(order.id)}>
                                            <TableCell className="font-mono font-medium text-primary group-hover:text-primary/80 transition-colors">
                                                {order.order_number}
                                            </TableCell>
                                            <TableCell className="font-medium">{order.customer_name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{formatDateTime(order.created_at)}</TableCell>
                                            <TableCell className="text-right font-mono font-medium">{formatCurrency(order.total_amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${getStatusColor(order.status)} border-0 px-3 py-1`}>
                                                    {getStatusLabel(order.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Order Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Order</DialogTitle>
                        <DialogDescription>Fill in the details to create a new customer order.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        {/* ... (Existing form content kept largely same for brevity, can enhance if needed) ... */}
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Order Number</label>
                                    <Input value={formData.order_number} disabled className="font-mono bg-muted/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Customer Name <span className="text-red-500">*</span></label>
                                    <Input
                                        required
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Order Items</label>
                                    <Button type="button" size="sm" variant="secondary" onClick={addItem}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Item
                                    </Button>
                                </div>
                                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                                    {formData.items.length === 0 && <p className="text-sm text-center text-muted-foreground py-2">No items added yet.</p>}
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-end bg-background p-3 rounded-md shadow-sm">
                                            <div className="flex-1 space-y-1">
                                                <label className="text-xs text-muted-foreground">Product</label>
                                                <select
                                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                    value={item.product_id}
                                                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                >
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-24 space-y-1">
                                                <label className="text-xs text-muted-foreground">Qty</label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="w-32 space-y-1">
                                                <label className="text-xs text-muted-foreground">Price</label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(index)}>
                                                <PackageX className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Input
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Internal notes for this order..."
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button type="submit">Create Order</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Order Details Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden">
                    {selectedOrder && (
                        <>
                            {/* Header Section */}
                            <div className="p-6 bg-muted/30 border-b">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold tracking-tight font-mono">{selectedOrder.order_number}</h2>
                                            <Badge className={`${getStatusColor(selectedOrder.status)} border-0`}>
                                                {getStatusLabel(selectedOrder.status)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDateTime(selectedOrder.created_at)}</span>
                                            <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Total: <span className="text-foreground font-semibold">{formatCurrency(selectedOrder.total_amount)}</span></span>
                                        </div>
                                    </div>
                                    {['DELIVERED', 'SHIPPED', 'PACKED'].includes(selectedOrder.status) && (
                                        <div className="flex gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => openReturnDialog('RETURN')} className="border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-orange-900 dark:hover:bg-orange-900/20">
                                                            <RotateCcw className="w-4 h-4 mr-2" />
                                                            Return
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Mark as Customer Return</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => openReturnDialog('RTO')} className="border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-900/20">
                                                            <PackageX className="w-4 h-4 mr-2" />
                                                            RTO
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Mark as Return to Origin</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    )}
                                </div>

                                {/* Status Timeline */}
                                <div className="mt-8 mb-2 px-4">
                                    <StatusTimeline
                                        currentStatus={selectedOrder.status}
                                        onUpdateStatus={updateOrderStatus}
                                    />
                                </div>
                            </div>

                            <div className="p-6 grid md:grid-cols-3 gap-8">
                                {/* Left Column: Customer & Details */}
                                <div className="md:col-span-1 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Customer Details</h3>
                                        <Card className="border-none shadow-none bg-muted/30">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <User className="w-4 h-4 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-sm">{selectedOrder.customer_name}</p>
                                                        <p className="text-xs text-muted-foreground">Customer</p>
                                                    </div>
                                                </div>
                                                {selectedOrder.customer_email && (
                                                    <div className="flex items-start gap-3">
                                                        <Mail className="w-4 h-4 text-primary mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-sm">{selectedOrder.customer_email}</p>
                                                            <p className="text-xs text-muted-foreground">Email</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedOrder.customer_phone && (
                                                    <div className="flex items-start gap-3">
                                                        <Phone className="w-4 h-4 text-primary mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-sm">{selectedOrder.customer_phone}</p>
                                                            <p className="text-xs text-muted-foreground">Phone</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {selectedOrder.notes && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Notes</h3>
                                            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-sm text-amber-900 dark:text-amber-100">
                                                {selectedOrder.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Order Items */}
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Items</h3>
                                    <div className="rounded-lg border overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead className="text-right">Qty</TableHead>
                                                    <TableHead className="text-right">Price</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedOrder.items?.map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{item.product_name}</p>
                                                                <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                                        <TableCell className="text-right text-muted-foreground">{formatCurrency(item.price)}</TableCell>
                                                        <TableCell className="text-right font-medium">{formatCurrency(item.price * item.quantity)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-muted/20 font-medium">
                                                    <TableCell colSpan={3} className="text-right">Total Amount</TableCell>
                                                    <TableCell className="text-right text-lg">{formatCurrency(selectedOrder.total_amount)}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Return/RTO Dialog */}
            <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark as {returnType === 'RTO' ? 'Return to Origin (RTO)' : 'Customer Return'}</DialogTitle>
                        <DialogDescription>
                            This will create a return record and link the packing video evidence
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason *</label>
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                            >
                                <option value="">Select a reason</option>
                                {returnReasons.map(reason => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Additional Notes</label>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={returnNotes}
                                onChange={(e) => setReturnNotes(e.target.value)}
                                placeholder="Optional notes about the return..."
                            />
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400 flex gap-2">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p><strong>Heads up:</strong> Packing video will be automatically linked as evidence and locked from deletion.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Cancel</Button>
                        <Button onClick={handleMarkAsReturn}>Mark as {returnType}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
