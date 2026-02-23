import React, { useEffect, useState } from 'react';
import {
    Search,
    Save,
    RefreshCcw,
    AlertCircle,
    CheckCircle2,
    ArrowRightLeft,
    Package,
    History,
    ShieldAlert,
    ChevronRight,
    SearchX,
    ClipboardCheck,
    Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime, cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const InventoryReconciliation = () => {
    const { hasPermission, activePlan } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reconcileData, setReconcileData] = useState({
        actual_quantity: '',
        reason: '',
        notes: ''
    });

    const searchProduct = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            const results = await window.electronAPI.products.getAll();
            const filtered = results.filter(p =>
                p.sku.toLowerCase().includes(query.toLowerCase()) ||
                p.name.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) searchProduct(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleReconcile = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        try {
            setLoading(true);
            await window.electronAPI.inventory.reconcile({
                product_id: selectedProduct.id,
                actual_quantity: parseInt(reconcileData.actual_quantity),
                reason: reconcileData.reason,
                notes: reconcileData.notes
            });

            toast({
                title: "Reconciliation Logged",
                description: `System state updated for ${selectedProduct.name}`,
            });

            setSelectedProduct(null);
            setReconcileData({ actual_quantity: '', reason: '', notes: '' });
            setSearchQuery('');
        } catch (error) {
            toast({
                title: "Protocol Error",
                description: "Failed to commit reconciliation data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!hasPermission('reconcile_inventory')) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="glass-card max-w-md p-10 text-center border-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                    <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black mb-2 text-foreground dark:text-white tracking-tighter">Access Inhibited</h2>
                    <p className="text-muted-foreground italic">Elevated authorization is required for inventory State-Sync operations.</p>
                </div>
            </div>
        );
    }

    if (activePlan === 'STARTER') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-10 text-center px-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <div className="glass shadow-2xl p-10 rounded-[3rem] border-white/10 relative">
                        <ArrowRightLeft className="w-24 h-24 text-primary" />
                    </div>
                </div>

                <div className="max-w-lg space-y-3">
                    <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white font-display">State-Sync Intelligence</h1>
                    <p className="text-xl text-muted-foreground italic">
                        Align physical stock levels with digital records using high-precision audit tools.
                    </p>
                </div>

                <div className="w-full max-w-md glass-card p-10 border-primary/20 bg-primary/5 shadow-2xl rounded-[2.5rem]">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-8 underline decoration-4 underline-offset-8">Advanced Tier Feature</h3>
                    <ul className="space-y-6 mb-10">
                        <li className="flex items-center gap-4 text-left">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-primary text-sm font-black">✓</span>
                            </div>
                            <span className="font-bold text-foreground dark:text-white/80">Real-time Quantity Logic</span>
                        </li>
                        <li className="flex items-center gap-4 text-left">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-primary text-sm font-black">✓</span>
                            </div>
                            <span className="font-bold text-foreground dark:text-white/80">Loss Prevention Auditing</span>
                        </li>
                        <li className="flex items-center gap-4 text-left">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-primary text-sm font-black">✓</span>
                            </div>
                            <span className="font-bold text-foreground dark:text-white/80">Discrepancy Signal Mapping</span>
                        </li>
                    </ul>
                    <Button className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(var(--primary),0.3)] btn-pro-primary" asChild>
                        <a href="/pricing">Upgrade to Standard</a>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-1 text-foreground dark:text-white font-display">State-Sync</h1>
                    <p className="text-muted-foreground text-lg italic">High-precision inventory auditing & reconciliation</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 dark:text-white/60 font-bold gap-3 hover:bg-white/5">
                        <History className="w-5 h-5" />
                        Audit Log
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Search and Selection Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 border-white/5 space-y-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Signal Intercept</h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/20" />
                                <Input
                                    placeholder="Enter SKU or Product Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-14 bg-accent/30 dark:bg-white/5 shadow-xl rounded-2xl border-white/10 dark:text-white font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Results Found</span>
                                <Badge variant="outline" className="border-white/10 text-[10px] uppercase font-black">{searchResults.length}</Badge>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {searchResults.length > 0 ? (
                                        searchResults.map((p, index) => (
                                            <motion.div
                                                key={p.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className={cn(
                                                    "group p-4 rounded-xl border border-white/5 cursor-pointer transition-all duration-300",
                                                    selectedProduct?.id === p.id
                                                        ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                                        : "hover:bg-white/5 hover:border-white/10"
                                                )}
                                                onClick={() => setSelectedProduct(p)}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-black text-foreground dark:text-white font-display text-lg tracking-tight line-clamp-1">{p.name}</span>
                                                    <ChevronRight className={cn(
                                                        "w-4 h-4 transition-transform duration-300",
                                                        selectedProduct?.id === p.id ? "rotate-90 text-primary" : "text-muted-foreground/30"
                                                    )} />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{p.sku}</span>
                                                    <span className="text-[10px] font-black bg-accent/30 dark:bg-white/5 px-2 py-0.5 rounded-md text-foreground dark:text-white/60">
                                                        {p.quantity} Unit{p.quantity !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : searchQuery && !loading ? (
                                        <div className="py-12 text-center">
                                            <SearchX className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                                            <p className="text-xs font-bold text-muted-foreground italic">No signals matching "{searchQuery}"</p>
                                        </div>
                                    ) : !searchQuery ? (
                                        <div className="py-12 text-center">
                                            <Box className="w-10 h-10 text-muted-foreground/10 mx-auto mb-4" />
                                            <p className="text-xs font-bold text-muted-foreground/30 italic">Initialize search for Audit</p>
                                        </div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reconciliation Form Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {selectedProduct ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-card overflow-hidden"
                            >
                                <div className="h-2 w-full bg-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]" />
                                <div className="p-10">
                                    <div className="flex items-center gap-6 mb-12">
                                        <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                                            <ClipboardCheck className="w-10 h-10 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-foreground dark:text-white font-display tracking-tighter leading-none mb-2">{selectedProduct.name}</h2>
                                            <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-[0.2em] text-[10px] px-3">
                                                Active Audit Session
                                            </Badge>
                                        </div>
                                    </div>

                                    <form onSubmit={handleReconcile} className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Physical Count</label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        required
                                                        placeholder="0"
                                                        value={reconcileData.actual_quantity}
                                                        onChange={(e) => setReconcileData({ ...reconcileData, actual_quantity: e.target.value })}
                                                        className="h-20 text-4xl font-black text-center bg-accent/30 dark:bg-white/5 border-white/10 rounded-3xl font-display"
                                                    />
                                                    <div className="absolute top-1/2 -translate-y-1/2 right-6 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
                                                        <span className="text-[10px] font-black text-primary uppercase">Units</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between px-2 pt-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">System Balance:</span>
                                                    <span className="text-sm font-black text-foreground dark:text-white font-mono">{selectedProduct.quantity} Units</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Reconciliation Reason</label>
                                                <select
                                                    required
                                                    className="w-full h-20 rounded-3xl border border-white/10 bg-accent/30 dark:bg-white/5 px-6 py-2 text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none"
                                                    value={reconcileData.reason}
                                                    onChange={(e) => setReconcileData({ ...reconcileData, reason: e.target.value })}
                                                >
                                                    <option value="" disabled className="bg-background">Select Protocol...</option>
                                                    <option value="PHYSICAL_COUNT" className="bg-background">Cycle Count Audit</option>
                                                    <option value="DAMAGE" className="bg-background">Damaged / Liquidation</option>
                                                    <option value="RETURN" className="bg-background">Signal Return Adjustment</option>
                                                    <option value="OTHER" className="bg-background">Custom Override</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Audit Notes</label>
                                            <textarea
                                                className="w-full min-h-[140px] rounded-3xl border border-white/10 bg-accent/30 dark:bg-white/5 p-6 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-none transition-all focus:bg-accent/50"
                                                placeholder="Provide detailed context for this State-Sync event..."
                                                value={reconcileData.notes}
                                                onChange={(e) => setReconcileData({ ...reconcileData, notes: e.target.value })}
                                            />
                                        </div>

                                        <div className="pt-6 flex gap-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setSelectedProduct(null)}
                                                className="h-14 px-8 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/5"
                                                disabled={loading}
                                            >
                                                Abort Session
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="h-14 px-10 flex-1 font-black uppercase tracking-widest text-sm rounded-2xl shadow-[0_15px_40px_rgba(var(--primary),0.3)] btn-pro-primary"
                                                disabled={loading}
                                            >
                                                {loading ? <RefreshCcw className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                                                Commit State-Sync
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[500px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="w-32 h-32 rounded-full bg-accent/30 dark:bg-white/5 flex items-center justify-center mb-8 shadow-inner border border-white/5">
                                    <ClipboardCheck className="w-12 h-12 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-3xl font-black text-foreground dark:text-white tracking-tighter mb-4">No Unit Selected</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto italic text-lg">
                                    Select a product signal from the left intercept panel to initiate a synchronization session.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default InventoryReconciliation;
