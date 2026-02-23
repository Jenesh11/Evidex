
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingDown,
    TrendingUp,
    Package,
    RotateCcw,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hasFeature, PLANS } from '@/config/plans';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Improved Bar Chart Component
const SimpleBarChart = ({ data, maxValue, color = "bg-primary" }) => (
    <div className="space-y-6">
        {data.map((item, index) => (
            <motion.div
                key={index}
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest px-1">
                    <span className="text-muted-foreground dark:text-white/40 truncate max-w-[200px]">{item.label}</span>
                    <span className="text-foreground dark:text-white">{item.count}</span>
                </div>
                <div className="h-3 w-full bg-accent/30 dark:bg-white/5 rounded-full overflow-hidden border border-border/20 dark:border-white/5 p-[2px]">
                    <motion.div
                        className={`h-full ${color} rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / maxValue) * 100}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                    />
                </div>
            </motion.div>
        ))}
    </div>
);

// Enhanced Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, color, bgColor, trend }) => (
    <div className="glass-card p-6 border-white/5 group hover:border-primary/20 transition-all duration-500">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40 mb-1">{title}</p>
                <h3 className="text-4xl font-black text-foreground dark:text-white tracking-tighter font-display">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${bgColor} backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
        </div>
        <div className="mt-6 flex items-center text-[10px] font-bold uppercase tracking-widest px-1">
            {trend && (
                <span className={`flex items-center font-black ${trend > 0 ? 'text-red-500' : 'text-emerald-500'} mr-3 py-1 px-2 rounded-lg bg-current/5 border border-current/10`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {Math.abs(trend)}%
                </span>
            )}
            <span className="text-muted-foreground dark:text-white/30 italic">{subtitle}</span>
        </div>
    </div>
);

export default function Analytics() {
    const { effectivePlan } = useAuth();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalOrders: 0,
        deliveredOrders: 0,
        totalReturns: 0,
        rtoCount: 0,
        returnRate: 0
    });
    const [productRTOData, setProductRTOData] = useState([]);
    const [reasonBreakdown, setReasonBreakdown] = useState([]);
    const [courierStats, setCourierStats] = useState([]);

    const currentPlan = effectivePlan === 'PRO' ? PLANS.PRO :
        effectivePlan === 'ENTERPRISE' ? PLANS.ENTERPRISE : PLANS.STARTER;

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            // Load all data with fallback for empty/undefined
            const orders = (await window.electronAPI.orders.getAll()) || [];
            const returns = (await window.electronAPI.returns.getAll()) || [];
            const products = (await window.electronAPI.products.getAll()) || [];

            // Calculate basic metrics
            const totalOrders = orders.length;
            const deliveredOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'PACKED').length;
            const totalReturns = returns.length;
            const rtoCount = returns.filter(r => r.return_type === 'RTO').length;
            const returnRate = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;

            setMetrics({
                totalOrders,
                deliveredOrders,
                totalReturns,
                rtoCount,
                returnRate
            });

            // Calculate RTO % by product
            const productStats = calculateProductRTO(orders, returns, products);
            setProductRTOData(productStats);

            // Calculate return reason breakdown
            const reasons = calculateReasonBreakdown(returns);
            setReasonBreakdown(reasons);

            // Calculate courier-wise RTO stats
            const courierData = calculateCourierStats(orders);
            setCourierStats(courierData);

        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateProductRTO = (orders, returns, products) => {
        const productMap = {};

        // Initialize product stats
        products.forEach(product => {
            productMap[product.id] = {
                id: product.id,
                name: product.name,
                totalOrders: 0,
                rtoCount: 0,
                rtoPercentage: 0
            };
        });

        // Count total orders per product
        orders.forEach(order => {
            // Get order items for this order - handle both stringified JSON and objects
            let orderItems = [];
            try {
                orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
            } catch (e) {
                console.warn('Failed to parse order items:', e, order.id);
            }

            if (Array.isArray(orderItems)) {
                orderItems.forEach(item => {
                    if (item && item.product_id && productMap[item.product_id]) {
                        productMap[item.product_id].totalOrders++;
                    }
                });
            }
        });

        // Count RTOs per product
        const rtoReturns = returns.filter(r => r && r.return_type === 'RTO');
        rtoReturns.forEach(rto => {
            const order = orders.find(o => o.id === rto.order_id);
            if (order) {
                let orderItems = [];
                try {
                    orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                } catch (e) {
                    console.warn('Failed to parse order items for RTO:', e, order.id);
                }

                if (Array.isArray(orderItems)) {
                    orderItems.forEach(item => {
                        if (item && item.product_id && productMap[item.product_id]) {
                            productMap[item.product_id].rtoCount++;
                        }
                    });
                }
            }
        });

        // Calculate percentages and filter products with orders
        return Object.values(productMap)
            .filter(stat => stat.totalOrders > 0)
            .map(stat => ({
                ...stat,
                rtoPercentage: (stat.rtoCount / stat.totalOrders) * 100
            }))
            .sort((a, b) => b.rtoPercentage - a.rtoPercentage)
            .slice(0, 5); // Start with top 5 for better UI fit
    };

    const calculateReasonBreakdown = (returns) => {
        const reasonCounts = {};

        returns.forEach(ret => {
            const reason = ret.reason || 'Not specified';
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });

        const total = returns.length;
        if (total === 0) return [];

        return Object.entries(reasonCounts)
            .map(([reason, count]) => ({
                label: reason,
                count,
                value: (count / total) * 100
            }))
            .sort((a, b) => b.count - a.count);
    };

    const calculateCourierStats = (orders) => {
        const courierMap = {};

        orders.forEach(order => {
            const courier = order.courier_name || 'Not Specified';

            if (!courierMap[courier]) {
                courierMap[courier] = {
                    name: courier,
                    totalOrders: 0,
                    rtoCount: 0,
                    rtoPercentage: 0
                };
            }

            courierMap[courier].totalOrders++;

            if (order.status === 'RTO') {
                courierMap[courier].rtoCount++;
            }
        });

        // Calculate percentages and sort by RTO %
        return Object.values(courierMap)
            .map(stat => ({
                ...stat,
                rtoPercentage: stat.totalOrders > 0 ? (stat.rtoCount / stat.totalOrders) * 100 : 0
            }))
            .sort((a, b) => b.rtoPercentage - a.rtoPercentage);
    };

    const getRTOBadgeColor = (percentage) => {
        if (percentage < 5) return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
        if (percentage < 15) return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // Check if plan has access to analytics
    if (!hasFeature(currentPlan, 'analytics')) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">RTO & Return Analytics</h1>
                    <p className="text-muted-foreground">Analyze return patterns and identify problem areas</p>
                </div>
                <UpgradePrompt
                    feature="RTO & Return Analytics"
                    requiredPlan="PRO"
                    description="Upgrade to Pro to access detailed analytics on RTO patterns, return reasons, and courier performance."
                />
            </div>
        );
    }

    const maxRTOPercentage = Math.max(...productRTOData.map(p => p.rtoPercentage), 1);
    const maxReasonPercentage = Math.max(...reasonBreakdown.map(r => r.value), 1);

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2 text-foreground dark:text-white font-display">Intelligence</h1>
                    <p className="text-muted-foreground text-lg italic">Advanced delivery performance & RTO risk mapping</p>
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 dark:text-white/60 dark:hover:text-white hover:bg-white/5 transition-all font-bold gap-3">
                    <Calendar className="w-5 h-5" />
                    Archive: Last 30 Days
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <MetricCard
                        title="Global Orders"
                        value={metrics.totalOrders}
                        icon={Package}
                        subtitle="System wide total"
                        color="text-blue-500"
                        bgColor="bg-blue-500/10"
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <MetricCard
                        title="Returned"
                        value={metrics.totalReturns}
                        icon={RotateCcw}
                        subtitle="Customer initiated"
                        color="text-orange-500"
                        bgColor="bg-orange-500/10"
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <MetricCard
                        title="RTO Incidents"
                        value={metrics.rtoCount}
                        icon={TrendingDown}
                        subtitle="Delivery failure"
                        color="text-red-500"
                        bgColor="bg-red-500/10"
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <MetricCard
                        title="Health Index"
                        value={`${metrics.returnRate.toFixed(1)}%`}
                        icon={BarChart3}
                        subtitle="Operational efficiency"
                        color={metrics.returnRate < 10 ? "text-emerald-500" : "text-red-500"}
                        bgColor={metrics.returnRate < 10 ? "bg-emerald-500/10" : "bg-red-500/10"}
                    />
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RTO % by Product */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <div className="glass-card overflow-hidden">
                        <div className="p-8 border-b border-white/5">
                            <h2 className="flex items-center gap-3 text-xl font-bold font-display text-foreground dark:text-white">
                                <AlertCircle className="w-5 h-5 text-primary" />
                                Critical Risk Mapping
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">High-impact return patterns by product</p>
                        </div>
                        <div className="p-8">
                            {productRTOData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground italic">
                                    <Package className="w-16 h-16 mb-4 opacity-10" />
                                    <p>Insufficient data for risk mapping</p>
                                </div>
                            ) : (
                                <SimpleBarChart
                                    data={productRTOData.map(p => ({
                                        label: p.name,
                                        value: p.rtoPercentage,
                                        count: `${p.rtoPercentage.toFixed(1)}%`
                                    }))}
                                    maxValue={maxRTOPercentage}
                                    color="bg-primary"
                                />
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Return Reason Breakdown */}
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                    <div className="glass-card overflow-hidden">
                        <div className="p-8 border-b border-white/5">
                            <h2 className="flex items-center gap-3 text-xl font-bold font-display text-foreground dark:text-white">
                                <FileText className="w-5 h-5 text-orange-500" />
                                Root Cause Vectors
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">Causation analysis for non-delivery</p>
                        </div>
                        <div className="p-8">
                            {reasonBreakdown.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground italic">
                                    <RotateCcw className="w-16 h-16 mb-4 opacity-10" />
                                    <p>Vector profiles pending ingestion</p>
                                </div>
                            ) : (
                                <SimpleBarChart
                                    data={reasonBreakdown}
                                    maxValue={maxReasonPercentage}
                                    color="bg-orange-500"
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="space-y-10">
                <div className="glass-card overflow-hidden">
                    <div className="p-8 border-b border-white/5">
                        <h2 className="text-2xl font-bold font-display text-foreground dark:text-white tracking-tight">Active Protection Ledger</h2>
                        <p className="text-muted-foreground italic mt-1">Real-time SKU performance & RTO risk levels</p>
                    </div>
                    <div className="p-8">
                        <div className="rounded-[2rem] border border-border/50 dark:border-white/5 overflow-hidden bg-background/30 dark:bg-white/[0.02]">
                            <Table>
                                <TableHeader className="bg-accent/50 dark:bg-white/5">
                                    <TableRow className="hover:bg-transparent border-border/50 dark:border-white/5 h-16">
                                        <TableHead className="text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px] pl-8">SKU Identifier</TableHead>
                                        <TableHead className="text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Orders</TableHead>
                                        <TableHead className="text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">RTO</TableHead>
                                        <TableHead className="text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Rate</TableHead>
                                        <TableHead className="text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px] pr-8">Risk Matrix</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productRTOData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                                No SKU data encountered in current session
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        productRTOData.map((product) => (
                                            <TableRow key={product.id} className="group hover:bg-white/5 transition-all duration-300 border-border/50 dark:border-white/5 h-20">
                                                <TableCell className="font-bold text-lg text-foreground dark:text-white pl-8 font-display">{product.name}</TableCell>
                                                <TableCell className="text-right font-black text-muted-foreground dark:text-white/60">{product.totalOrders}</TableCell>
                                                <TableCell className="text-right font-black text-red-400">{product.rtoCount}</TableCell>
                                                <TableCell className="text-right font-black font-mono text-primary bg-primary/5 px-4 rounded-xl inline-flex h-10 items-center justify-center m-4">
                                                    {product.rtoPercentage.toFixed(1)}%
                                                </TableCell>
                                                <TableCell className="pr-8">
                                                    {product.rtoPercentage > 20 ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                                            <TrendingUp className="w-3 h-3" /> High Risk Vector
                                                        </div>
                                                    ) : product.rtoPercentage > 10 ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                            <AlertCircle className="w-3 h-3" /> Elevated Threat
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                            <TrendingDown className="w-3 h-3" /> Minimum Impact
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {hasFeature(currentPlan, 'courier_analytics') && (
                    <div className="glass-card overflow-hidden">
                        <div className="p-8 border-b border-white/5">
                            <h2 className="text-2xl font-bold font-display text-foreground dark:text-white tracking-tight">Logistics Network Integrity</h2>
                            <p className="text-muted-foreground italic mt-1">Delivery partner efficiency & attrition ranking</p>
                        </div>
                        <div className="p-8">
                            <div className="rounded-[2rem] border border-border/50 dark:border-white/5 overflow-hidden bg-background/30 dark:bg-white/[0.02]">
                                <Table>
                                    <TableHeader className="bg-accent/50 dark:bg-white/5">
                                        <TableRow className="hover:bg-transparent border-border/50 dark:border-white/5 h-16">
                                            <TableHead className="text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px] pl-8">Carrier Entity</TableHead>
                                            <TableHead className="text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Volume</TableHead>
                                            <TableHead className="text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Return Vector</TableHead>
                                            <TableHead className="text-right text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Failure Rate</TableHead>
                                            <TableHead className="text-muted-foreground dark:text-white/40 font-black uppercase tracking-widest text-[10px] pr-8">Trust Profile</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courierStats.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                                    Infrastructure data pending synchronization
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            courierStats.map((courier, index) => (
                                                <TableRow key={index} className="group hover:bg-white/5 transition-all duration-300 border-border/50 dark:border-white/5 h-20">
                                                    <TableCell className="font-bold text-lg text-foreground dark:text-white pl-8 font-display">{courier.name}</TableCell>
                                                    <TableCell className="text-right font-black text-muted-foreground dark:text-white/60">{courier.totalOrders}</TableCell>
                                                    <TableCell className="text-right font-black text-red-400">{courier.rtoCount}</TableCell>
                                                    <TableCell className="text-right font-black font-mono text-primary bg-primary/5 px-4 rounded-xl inline-flex h-10 items-center justify-center m-4">
                                                        {courier.rtoPercentage.toFixed(1)}%
                                                    </TableCell>
                                                    <TableCell className="pr-8">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner",
                                                            courier.rtoPercentage < 5 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                                courier.rtoPercentage < 15 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                                    "bg-red-500/10 text-red-400 border-red-500/20"
                                                        )}>
                                                            {courier.rtoPercentage < 5 ? 'Elite Access' :
                                                                courier.rtoPercentage < 15 ? 'Verified' : 'High Variance'}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
