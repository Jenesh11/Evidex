import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, RotateCcw, PackageX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDateTime, getStatusColor, getStatusLabel, generateOrderNumber } from '@/lib/utils';

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
        } catch (error) {
            console.error('Error creating order:', error);
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

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await window.electronAPI.orders.updateStatus(orderId, newStatus);
            loadOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                const updated = await window.electronAPI.orders.getById(orderId);
                setSelectedOrder(updated);
            }
        } catch (error) {
            console.error('Error updating status:', error);
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
            alert('Please select a reason');
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

            alert(`Order marked as ${returnType} successfully!`);
            setShowReturnDialog(false);
            setShowDetailDialog(false);
            loadOrders();
        } catch (error) {
            console.error('Error marking as return:', error);
            alert('Failed to mark as return');
        }
    };

    const statusFlow = ['NEW', 'PACKING', 'PACKED', 'SHIPPED', 'DELIVERED'];

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Orders</h1>
                    <p className="text-muted-foreground">Manage customer orders</p>
                </div>
                <Button size="lg" onClick={() => { resetForm(); setShowDialog(true); }}>
                    <Plus className="w-5 h-5 mr-2" />
                    New Order
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search orders by number or customer..."
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
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <p className="text-muted-foreground">No orders found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono font-semibold">{order.order_number}</TableCell>
                                        <TableCell>{order.customer_name}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDateTime(order.created_at)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(order.total_amount)}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(order.status)}>
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order.id)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Order Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Order</DialogTitle>
                        <DialogDescription>Fill in the order details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Order Number</label>
                                    <Input value={formData.order_number} disabled className="font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Customer Name</label>
                                    <Input
                                        required
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Order Items</label>
                                    <Button type="button" size="sm" onClick={addItem}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Item
                                    </Button>
                                </div>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <select
                                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                                value={item.product_id}
                                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                            >
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} - {p.sku}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            className="w-24"
                                            placeholder="Qty"
                                        />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.price}
                                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                                            className="w-32"
                                            placeholder="Price"
                                        />
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Input
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Optional notes"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button type="submit">Create Order</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Order Details Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Number</p>
                                    <p className="font-mono font-semibold">{selectedOrder.order_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                        {getStatusLabel(selectedOrder.status)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-medium">{selectedOrder.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="font-semibold text-lg">{formatCurrency(selectedOrder.total_amount)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Items</p>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-secondary rounded-lg">
                                            <span>{item.product_name} ({item.sku})</span>
                                            <span className="font-semibold">{item.quantity} × {formatCurrency(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                                <div className="flex gap-2 flex-wrap">
                                    {statusFlow.map(status => (
                                        <Button
                                            key={status}
                                            size="sm"
                                            variant={selectedOrder.status === status ? 'default' : 'outline'}
                                            onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                        >
                                            {getStatusLabel(status)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Return/RTO Actions */}
                            {['DELIVERED', 'SHIPPED', 'PACKED'].includes(selectedOrder.status) && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-3">Returns & RTO</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => openReturnDialog('RETURN')}>
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Mark as Return
                                        </Button>
                                        <Button variant="outline" onClick={() => openReturnDialog('RTO')}>
                                            <PackageX className="w-4 h-4 mr-2" />
                                            Mark as RTO
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Return/RTO Dialog */}
            <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark as {returnType}</DialogTitle>
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
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400">
                            <p><strong>Note:</strong> Packing video will be automatically linked as evidence and locked from deletion.</p>
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
