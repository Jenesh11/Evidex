import React, { useEffect, useState } from 'react';
import { Search, Scale, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { hasFeature, PLANS } from '@/config/plans';
import { UpgradePrompt } from '@/components/UpgradePrompt';

const RECONCILIATION_REASONS = [
    'Physical count mismatch',
    'Damaged goods',
    'Theft/Loss',
    'System error',
    'Supplier error',
    'Return processing',
    'Other'
];

export default function InventoryReconciliation() {
    const { user, profile, effectivePlan } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [physicalCounts, setPhysicalCounts] = useState({});
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [isReconciling, setIsReconciling] = useState(false);

    const currentPlan = effectivePlan === 'PRO' ? PLANS.PRO :
        effectivePlan === 'ENTERPRISE' ? PLANS.ENTERPRISE : PLANS.STARTER;

    const loadProducts = async () => {
        try {
            const data = await window.electronAPI.inventory.getAll();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const calculateDifference = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return 0;
        const physical = parseInt(physicalCounts[productId]) || 0;
        return physical - product.quantity;
    };

    const handlePhysicalCountChange = (productId, value) => {
        setPhysicalCounts(prev => ({
            ...prev,
            [productId]: value
        }));

        // Auto-select if there's a difference
        const product = products.find(p => p.id === productId);
        const physical = parseInt(value) || 0;
        const diff = physical - product.quantity;

        if (diff !== 0) {
            setSelectedProducts(prev => new Set([...prev, productId]));
        } else {
            setSelectedProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const handleReconcile = async () => {
        try {
            // Validate permissions
            if (!['ADMIN', 'MANAGER'].includes(user?.role)) {
                alert('Access denied - insufficient permissions');
                return;
            }

            // Validate selections
            if (selectedProducts.size === 0) {
                alert('Please select products to reconcile');
                return;
            }

            // Validate reason
            if (!reason) {
                alert('Please select a reason for reconciliation');
                return;
            }

            setIsReconciling(true);

            // Create reconciliation movements
            const movements = Array.from(selectedProducts).map(productId => {
                const diff = calculateDifference(productId);
                const product = products.find(p => p.id === productId);

                return {
                    product_id: productId,
                    quantity: Math.abs(diff),
                    direction: diff > 0 ? 'IN' : 'OUT',
                    reason: 'RECONCILIATION',
                    notes: `${reason}${notes ? ': ' + notes : ''} (System: ${product.quantity}, Physical: ${physicalCounts[productId] || 0})`,
                    performed_by: user.id
                };
            }).filter(m => m.quantity > 0); // Only include non-zero differences

            if (movements.length === 0) {
                alert('No differences to reconcile');
                setIsReconciling(false);
                return;
            }

            await window.electronAPI.inventory.reconcile(movements);

            alert(`Reconciliation completed successfully for ${movements.length} product(s)`);

            // Reset form
            setPhysicalCounts({});
            setSelectedProducts(new Set());
            setReason('');
            setNotes('');

            // Reload products
            loadProducts();
        } catch (error) {
            console.error('Error reconciling inventory:', error);
            alert(`Failed to reconcile inventory: ${error.message}`);
        } finally {
            setIsReconciling(false);
        }
    };

    const getDifferenceColor = (diff) => {
        if (diff === 0) return 'text-muted-foreground';
        if (diff > 0) return 'text-green-600 dark:text-green-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getDifferenceIcon = (diff) => {
        if (diff === 0) return <CheckCircle className="w-4 h-4 text-green-500" />;
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    };

    // Check if user has permission
    const userRole = profile?.role || user?.role;
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>Only ADMIN and MANAGER roles can access inventory reconciliation</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    // Check if plan has access to reconciliation
    if (!hasFeature(currentPlan, 'inventory_reconciliation')) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Inventory Reconciliation</h1>
                    <p className="text-muted-foreground">Correct stock mismatches through physical count</p>
                </div>
                <UpgradePrompt
                    feature="Inventory Reconciliation"
                    requiredPlan="PRO"
                    description="Upgrade to Pro to reconcile inventory discrepancies and maintain accurate stock levels."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Inventory Reconciliation</h1>
                <p className="text-muted-foreground">Correct stock mismatches through physical count</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product Reconciliation</CardTitle>
                    <CardDescription>Enter physical counts to reconcile inventory</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search products by name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12"
                            />
                        </div>

                        {/* Product Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">System Qty</TableHead>
                                        <TableHead className="text-right">Physical Qty</TableHead>
                                        <TableHead className="text-right">Difference</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No products found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProducts.map((product) => {
                                            const diff = calculateDifference(product.id);
                                            const isSelected = selectedProducts.has(product.id);

                                            return (
                                                <TableRow key={product.id} className={isSelected ? 'bg-secondary/50' : ''}>
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleProductSelection(product.id)}
                                                            disabled={diff === 0}
                                                            className="w-4 h-4 cursor-pointer"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <p className="text-sm text-muted-foreground">{product.sku}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">{product.quantity}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Input
                                                            key={`${product.id}-${physicalCounts[product.id] || 'empty'}`}
                                                            type="number"
                                                            min="0"
                                                            value={physicalCounts[product.id] || ''}
                                                            onChange={(e) => handlePhysicalCountChange(product.id, e.target.value)}
                                                            placeholder="Enter count"
                                                            className="w-32 text-right"
                                                            disabled={isReconciling}
                                                        />
                                                    </TableCell>
                                                    <TableCell className={`text-right font-mono font-semibold ${getDifferenceColor(diff)}`}>
                                                        {diff > 0 ? '+' : ''}{diff}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getDifferenceIcon(diff)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Selected Summary */}
                        {selectedProducts.size > 0 && (
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Selected for reconciliation: {selectedProducts.size} product(s)
                                </p>
                            </div>
                        )}

                        {/* Reason and Notes */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Reason for Reconciliation *</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                >
                                    <option value="">Select a reason...</option>
                                    {RECONCILIATION_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Additional Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Optional notes about the reconciliation..."
                                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPhysicalCounts({});
                                    setSelectedProducts(new Set());
                                    setReason('');
                                    setNotes('');
                                }}
                            >
                                Reset
                            </Button>
                            <Button
                                onClick={handleReconcile}
                                disabled={isReconciling || selectedProducts.size === 0 || !reason}
                                className="gap-2"
                            >
                                <Scale className="w-4 h-4" />
                                {isReconciling ? 'Reconciling...' : `Reconcile ${selectedProducts.size} Product(s)`}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
