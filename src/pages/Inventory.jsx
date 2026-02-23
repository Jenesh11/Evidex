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
import { formatCurrency, cn } from '@/lib/utils';
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
        <div className="space-y-8 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground dark:text-white font-display">Inventory</h1>
                    <p className="text-muted-foreground text-lg italic">Manage your product catalog and enterprise stock levels</p>
                </div>
                <div className="flex gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="pro-outline" size="icon" onClick={handleRefresh} className="h-12 w-12 bg-transparent border-border/50 dark:border-white/10 text-foreground dark:text-white hover:bg-accent/50 dark:hover:bg-white/10 rounded-2xl">
                                    <RotateCcw className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-bold uppercase tracking-widest text-[10px]">Refresh</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button size="lg" onClick={() => { resetForm(); setShowDialog(true); }} className="btn-pro-primary h-12 px-8">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Product
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 dark:border-white/5 bg-card/30 backdrop-blur-md shadow-sm overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
                            <Input
                                placeholder="Search products by name or SKU..."
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
                                    <TableHead className="w-[180px] text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px] pl-8">SKU Code</TableHead>
                                    <TableHead className="text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Product Name</TableHead>
                                    <TableHead className="hidden md:table-cell text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Description</TableHead>
                                    <TableHead className="text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Quantity</TableHead>
                                    <TableHead className="text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Unit Price</TableHead>
                                    <TableHead className="w-[120px] text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px] pr-8">Actions</TableHead>
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
                                            <TableRow key={product.id} className="group hover:bg-accent/40 dark:hover:bg-white/[0.04] transition-all duration-300 border-border/50 dark:border-white/5 h-20">
                                                <TableCell className="font-mono font-bold text-primary pl-8 text-sm">
                                                    {product.sku}
                                                </TableCell>
                                                <TableCell className="font-bold text-foreground dark:text-white font-display text-lg">
                                                    {product.name}
                                                    {isLowStock && (
                                                        <span className="ml-3 inline-flex h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse" title="Low Stock" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-white/40 text-sm italic font-medium truncate max-w-[200px]">
                                                    {product.description || 'No description provided'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className={cn(
                                                        "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner",
                                                        isLowStock ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-primary/10 text-primary border-primary/20"
                                                    )}>
                                                        {product.quantity} Units
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-emerald-400 font-display text-lg">
                                                    {formatCurrency(product.price)}
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl" onClick={() => openEditDialog(product)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-red-500/5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => handleDelete(product.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
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
