import React, { useState, useEffect } from 'react';
import { Scale, AlertTriangle, Check, X, Search, CheckCircle, ClipboardCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import toast from '@/hooks/useToast';
import { hasFeature, PLANS } from '@/config/plans';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { Textarea } from '@/components/ui/textarea';

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

    // Filter products when search changes
    useEffect(() => {
        if (!searchQuery) {
            setFilteredProducts(products);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredProducts(products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query)
            ));
        }
    }, [searchQuery, products]);

    const calculateDifference = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return 0;
        const physical = parseInt(physicalCounts[productId]) || 0;
        return physical - product.quantity;
    };

    const handlePhysicalCountChange = (productId, value) => {
        // Allow empty string for better UX while typing
        const numericValue = value === '' ? '' : parseInt(value);

        setPhysicalCounts(prev => ({
            ...prev,
            [productId]: numericValue
        }));

        // Auto-select based on logic
        const product = products.find(p => p.id === productId);
        // Treat empty/NaN as 0 for diff calculation but don't force it in the UI input yet
        const physical = value === '' ? 0 : (parseInt(value) || 0);
        const diff = physical - product.quantity;

        if (diff !== 0) {
            setSelectedProducts(prev => new Set([...prev, productId]));
        } else {
            // Optional: Auto-deselect if diff is 0? 
            // Better to keep selected if user manually selected it, but for auto-flow let's be smart
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
                toast.error('Access denied - insufficient permissions');
                return;
            }

            // Validate selections
            if (selectedProducts.size === 0) {
                toast.warning('Please select products to reconcile');
                return;
            }

            // Validate reason
            if (!reason) {
                toast.warning('Please select a reason for reconciliation');
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
                toast.info('No differences to reconcile');
                setIsReconciling(false);
                return;
            }

            await window.electronAPI.inventory.reconcile(movements);

            toast.success(`Reconciliation completed successfully for ${movements.length} product(s)`);

            // Reset form
            setPhysicalCounts({});
            setSelectedProducts(new Set());
            setReason('');
            setNotes('');

            // Reload products
            loadProducts();
        } catch (error) {
            console.error('Error reconciling inventory:', error);
            toast.error(`Failed to reconcile inventory: ${error.message}`);
        } finally {
            setIsReconciling(false);
        }
    };

    const getDifferenceColor = (diff) => {
        if (diff === 0) return 'text-muted-foreground';
        if (diff > 0) return 'text-green-600 dark:text-green-400 font-bold';
        return 'text-red-600 dark:text-red-400 font-bold';
    };

    const getDifferenceIcon = (diff) => {
        if (diff === 0) return <CheckCircle className="w-4 h-4 text-muted-foreground/30" />;
        if (diff > 0) return <ClipboardCheck className="w-4 h-4 text-green-500" />;
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    };

    // Check if user has permission
    const userRole = profile?.role || user?.role;
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="max-w-md border-destructive/20 bg-destructive/5">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                            <Scale className="w-6 h-6 text-destructive" />
                        </div>
                        <CardTitle className="text-destructive">Access Denied</CardTitle>
                        <CardDescription>Only ADMIN and MANAGER roles can access Inventory Reconciliation.</CardDescription>
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
        <div className="space-y-6 pb-20 md:pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Inventory Reconciliation</h1>
                    <p className="text-muted-foreground">Sync your physical inventory with system records</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        setPhysicalCounts({});
                        setSelectedProducts(new Set());
                        setReason('');
                        setNotes('');
                        setSearchQuery('');
                    }}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Form
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Product List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="h-full flex flex-col shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Search className="w-5 h-5 text-primary" />
                                Find Products
                            </CardTitle>
                            <CardDescription>Search and enter physical counts for products</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-muted/30 focus:bg-background transition-all"
                                />
                            </div>

                            <div className="border rounded-xl bg-card overflow-hidden flex-1 min-h-[400px]">
                                <Table>
                                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead className="w-[40px]"></TableHead>
                                            <TableHead>Product Details</TableHead>
                                            <TableHead className="text-right w-[100px]">System</TableHead>
                                            <TableHead className="text-right w-[120px]">Physical</TableHead>
                                            <TableHead className="text-right w-[100px]">Diff</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-3 opacity-80">
                                                        <div className="p-4 rounded-full bg-muted/50">
                                                            <clipboardCheck className="w-10 h-10 text-muted-foreground" />
                                                            {/* Standard Lucide icon fallback if ClipboardCheck fails? No it is valid */}
                                                            <Scale className="w-10 h-10 text-muted-foreground" />
                                                        </div>
                                                        <div className="text-lg font-medium">No products found</div>
                                                        <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProducts.map((product) => {
                                                const diff = calculateDifference(product.id);
                                                const isSelected = selectedProducts.has(product.id);
                                                const physicalCountValue = physicalCounts[product.id];
                                                // Handle 0 vs empty
                                                const displayValue = physicalCountValue === undefined ? '' : physicalCountValue;

                                                return (
                                                    <TableRow
                                                        key={product.id}
                                                        className={`transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                                                    >
                                                        <TableCell className="align-middle">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleProductSelection(product.id)}
                                                                // disabled={diff === 0} // Allow selecting even if 0? No, usually only reconcile diffs. But let's keep logic simple
                                                                disabled={diff === 0}
                                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:opacity-30"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col py-1">
                                                                <span className="font-medium text-sm">{product.name}</span>
                                                                <span className="text-xs text-muted-foreground font-mono">{product.sku}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-sm">
                                                            <Badge variant="secondary" className="font-normal">
                                                                {product.quantity}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={displayValue}
                                                                onChange={(e) => handlePhysicalCountChange(product.id, e.target.value)}
                                                                placeholder="-"
                                                                className={`w-20 text-right h-8 ml-auto ${displayValue !== '' ? 'border-primary' : ''}`}
                                                                disabled={isReconciling}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className={`font-mono font-bold text-sm ${getDifferenceColor(diff)}`}>
                                                                    {diff > 0 ? '+' : ''}{diff !== 0 ? diff : '-'}
                                                                </span>
                                                                {diff !== 0 && getDifferenceIcon(diff)}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-sm border-l-4 border-l-primary/50 sticky top-6">
                        <CardHeader className="bg-muted/10 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-primary" />
                                Review & Submit
                            </CardTitle>
                            <CardDescription>
                                Finalize inventory adjustments
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                <div className="text-sm text-muted-foreground mb-1">Products Selected</div>
                                <div className="text-3xl font-bold text-primary">{selectedProducts.size}</div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium">Reconciliation Reason <span className="text-destructive">*</span></label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="">Select a reason...</option>
                                    {RECONCILIATION_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium">Additional Notes</label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any relevant details or Reference IDs..."
                                    className="resize-none h-24 bg-background"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 pt-4 pb-4 border-t flex-col gap-3">
                            <Button
                                onClick={handleReconcile}
                                disabled={isReconciling || selectedProducts.size === 0 || !reason}
                                className="w-full text-base font-semibold shadow-md hover:shadow-lg transition-all"
                                size="lg"
                            >
                                {isReconciling ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        Reconcile Inventory
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground px-4">
                                This action will update inventory counts and log a reconciliation event.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
