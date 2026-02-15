import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit, Trash2, Package, RotateCcw,
    Tag, FileText, DollarSign, AlertTriangle, CheckCircle2,
    LayoutGrid, List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Inventory() {
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        quantity: 0,
        price: 0,
        low_stock_threshold: 10,
    });

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        // Ensure products is an array before filtering
        const productList = Array.isArray(products) ? products : [];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const filtered = productList.filter(p =>
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.sku && p.sku.toLowerCase().includes(query))
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(productList);
        }
    }, [searchQuery, products]);

    const loadProducts = async () => {
        try {
            console.log('[Inventory] Loading products...');
            const data = await window.electronAPI.products.getAll();
            console.log('[Inventory] Loaded products:', data);

            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                console.error('[Inventory] Invalid data received:', data);
                setProducts([]);
            }
        } catch (error) {
            console.error('[Inventory] Error loading products:', error);
            setProducts([]);
        }
    };

    const handleRefresh = () => {
        loadProducts();
        toast({ description: "Inventory refreshed" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert numeric strings back to numbers for API
            const submissionData = {
                ...formData,
                quantity: parseInt(formData.quantity) || 0,
                price: parseFloat(formData.price) || 0,
                low_stock_threshold: parseInt(formData.low_stock_threshold) || 0
            };

            // 1. Pre-Validate Unique SKU for new products
            if (!editingProduct) {
                const existingProduct = products.find(p => p.sku.toLowerCase() === submissionData.sku.toLowerCase());
                if (existingProduct) {
                    toast({
                        variant: "destructive",
                        title: "Duplicate SKU",
                        description: `A product with SKU "${submissionData.sku}" already exists.`,
                    });
                    return;
                }
            }

            if (editingProduct) {
                await window.electronAPI.products.update(editingProduct.id, submissionData);
                toast({ title: "Success", description: "Product updated successfully." });
            } else {
                await window.electronAPI.products.create(submissionData);
                toast({ title: "Success", description: "Product created successfully." });
            }
            await loadProducts(); // Wait for reload
            setShowDialog(false);
            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            // Handle unique constraint error if it slips through pre-validation
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                toast({
                    variant: "destructive",
                    title: "Duplicate SKU",
                    description: "This SKU is already taken. Please use a unique code.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to save product. Please try again.",
                });
            }
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await window.electronAPI.products.delete(id);
                loadProducts();
                toast({ title: "Deleted", description: "Product removed from inventory." });
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const openEditDialog = (product) => {
        setEditingProduct(product);
        setFormData({
            sku: product.sku,
            name: product.name,
            description: product.description || '',
            quantity: product.quantity,
            price: product.price,
            low_stock_threshold: product.low_stock_threshold,
        });
        setShowDialog(true);
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            sku: '',
            name: '',
            description: '',
            quantity: 0,
            price: 0,
            low_stock_threshold: 10,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground">Manage your product catalog and stock levels</p>
                </div>
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleRefresh}>
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Refresh Inventory</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button size="lg" onClick={() => { resetForm(); setShowDialog(true); }} className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Product
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search products by name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 bg-muted/30 border-muted"
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-[150px]"><div className="flex items-center gap-2"><Tag className="w-4 h-4" /> SKU</div></TableHead>
                                    <TableHead><div className="flex items-center gap-2"><Package className="w-4 h-4" /> Name</div></TableHead>
                                    <TableHead className="hidden md:table-cell"><div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Description</div></TableHead>
                                    <TableHead className="text-right"><div className="flex items-center justify-end gap-2"><LayoutGrid className="w-4 h-4" /> Quantity</div></TableHead>
                                    <TableHead className="text-right"><div className="flex items-center justify-end gap-2"><DollarSign className="w-4 h-4" /> Price</div></TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <p className="text-muted-foreground font-medium">No products found</p>
                                                <Button variant="link" onClick={() => { resetForm(); setShowDialog(true); }}>
                                                    Add your first product
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const isLowStock = product.quantity <= product.low_stock_threshold;
                                        return (
                                            <TableRow key={product.id} className="group hover:bg-muted/40 transition-colors">
                                                <TableCell className="font-mono font-medium text-primary">
                                                    {product.sku}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {product.name}
                                                    {isLowStock && (
                                                        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" title="Low Stock" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                                                    {product.description}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={isLowStock ? "destructive" : "secondary"} className={`${isLowStock ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20' : ''}`}>
                                                        {product.quantity} units
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-medium">
                                                    {formatCurrency(product.price)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => openEditDialog(product)}>
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent><p>Edit Product</p></TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(product.id)}>
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent><p>Delete Product</p></TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
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

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>
                            {editingProduct ? 'Make changes to your product here. Click save when you\'re done.' : 'Enter product details to add to your inventory.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-6 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">SKU <span className="text-red-500">*</span></label>
                                <Input
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="PROD-001"
                                    className="font-mono bg-muted/30"
                                />
                                <p className="text-xs text-muted-foreground">Unique Stock Keeping Unit</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Name <span className="text-red-500">*</span></label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Premium Widget"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter a brief description..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quantity <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="pl-9"
                                    />
                                    <LayoutGrid className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price ($) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="pl-9"
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    Low Stock Threshold
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertTriangle className="w-4 h-4 text-orange-500 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent><p>Alert when quantity falls below this number</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </label>
                                <Input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.low_stock_threshold}
                                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                                    className="max-w-[200px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingProduct ? 'Update Product' : 'Create Product'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
