import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Package, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

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
                // Initial filtering handled by useEffect
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
                    <h1 className="text-3xl font-bold mb-2">Inventory</h1>
                    <p className="text-muted-foreground">Manage your product catalog</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh}>
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Refresh
                    </Button>
                    <Button size="lg" onClick={() => { resetForm(); setShowDialog(true); }}>
                        <Plus className="w-5 h-5 mr-2" />
                        Add Product
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search products by name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">No products found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{product.description}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={product.quantity <= product.low_stock_threshold ? 'text-orange-500 font-semibold' : ''}>
                                                {product.quantity}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(product.price)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
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
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">SKU</label>
                                <Input
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="PROD-001"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Name</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Product name"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Product description"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quantity</label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Low Stock Threshold</label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.low_stock_threshold}
                                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
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
