
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

// Improved Bar Chart Component
const SimpleBarChart = ({ data, maxValue, color = "bg-primary" }) => (
    <div className="space-y-4">
        {data.map((item, index) => (
            <motion.div
                key={index}
                className="space-y-1.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[180px]">{item.label}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / maxValue) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </motion.div>
        ))}
    </div>
);

// Enhanced Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, color, bgColor, trend }) => (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-bold mt-2">{value}</h3>
                </div>
                <div className={`p - 3 rounded - xl ${bgColor} `}>
                    <Icon className={`w - 6 h - 6 ${color} `} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
                {trend && (
                    <span className={`flex items - center font - medium ${trend > 0 ? 'text-red-500' : 'text-green-500'} mr - 2`}>
                        {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(trend)}%
                    </span>
                )}
                <span className="text-muted-foreground">{subtitle}</span>
            </div>
        </CardContent>
    </Card>
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

            // Load all data
            const orders = await window.electronAPI.orders.getAll();
            const returns = await window.electronAPI.returns.getAll();
            const products = await window.electronAPI.products.getAll();

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
            // Get order items for this order
            const orderItems = order.items || [];
            orderItems.forEach(item => {
                if (productMap[item.product_id]) {
                    productMap[item.product_id].totalOrders++;
                }
            });
        });

        // Count RTOs per product
        const rtoReturns = returns.filter(r => r.return_type === 'RTO');
        rtoReturns.forEach(rto => {
            const order = orders.find(o => o.id === rto.order_id);
            if (order && order.items) {
                order.items.forEach(item => {
                    if (productMap[item.product_id]) {
                        productMap[item.product_id].rtoCount++;
                    }
                });
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
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">RTO Analytics</h1>
                    <p className="text-muted-foreground">Insights into returns and delivery performance</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Last 30 Days
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <MetricCard
                        title="Total Orders"
                        value={metrics.totalOrders}
                        icon={Package}
                        subtitle="All time orders"
                        color="text-blue-500"
                        bgColor="bg-blue-500/10"
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <MetricCard
                        title="Total Returns"
                        value={metrics.totalReturns}
                        icon={RotateCcw}
                        subtitle="Customer returns"
                        color="text-orange-500"
                        bgColor="bg-orange-500/10"
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <MetricCard
                        title="RTO Count"
                        value={metrics.rtoCount}
                        icon={TrendingDown}
                        subtitle="Return to origin"
                        color="text-red-500"
                        bgColor="bg-red-500/10"
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <MetricCard
                        title="Return Rate"
                        value={`${metrics.returnRate.toFixed(1)}% `}
                        icon={BarChart3}
                        subtitle="Overall rate"
                        color={metrics.returnRate < 10 ? "text-green-500" : "text-red-500"}
                        bgColor={metrics.returnRate < 10 ? "bg-green-500/10" : "bg-red-500/10"}
                    />
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RTO % by Product */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-primary" />
                                Highest RTO Products
                            </CardTitle>
                            <CardDescription>Top 5 products with highest return rates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productRTOData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Package className="w-12 h-12 mb-3 bg-muted/50 p-2 rounded-full" />
                                    <p>No product return data available</p>
                                </div>
                            ) : (
                                <SimpleBarChart
                                    data={productRTOData.map(p => ({
                                        label: p.name,
                                        value: p.rtoPercentage,
                                        count: `${p.rtoPercentage.toFixed(1)}% `
                                    }))}
                                    maxValue={maxRTOPercentage}
                                    color="bg-primary"
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Return Reason Breakdown */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Return Reasons
                            </CardTitle>
                            <CardDescription>Understanding why returns happen</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {reasonBreakdown.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <RotateCcw className="w-12 h-12 mb-3 bg-muted/50 p-2 rounded-full" />
                                    <p>No return reasons logged</p>
                                </div>
                            ) : (
                                <SimpleBarChart
                                    data={reasonBreakdown}
                                    maxValue={maxReasonPercentage}
                                    color="bg-orange-500"
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Detailed Tables */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Risk Analysis</CardTitle>
                        <CardDescription>Detailed breakdown of RTO metrics by product</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Product Name</TableHead>
                                        <TableHead className="text-right">Total Orders</TableHead>
                                        <TableHead className="text-right">RTO Count</TableHead>
                                        <TableHead className="text-right">RTO Rate</TableHead>
                                        <TableHead>Risk Level</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productRTOData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No data available
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        productRTOData.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell className="text-right">{product.totalOrders}</TableCell>
                                                <TableCell className="text-right">{product.rtoCount}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {product.rtoPercentage.toFixed(1)}%
                                                </TableCell>
                                                <TableCell>
                                                    {product.rtoPercentage > 20 ? (
                                                        <Badge variant="destructive" className="items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" /> High Risk
                                                        </Badge>
                                                    ) : product.rtoPercentage > 10 ? (
                                                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-500/20">
                                                            <AlertCircle className="w-3 h-3 mr-1" /> Medium Risk
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                                                            <TrendingDown className="w-3 h-3 mr-1" /> Low Risk
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Courier Performance Analysis */}
                {hasFeature(currentPlan, 'courier_analytics') && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Courier Performance</CardTitle>
                            <CardDescription>Delivery partner efficiency ranking</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                            <TableHead>Courier Name</TableHead>
                                            <TableHead className="text-right">Total Orders</TableHead>
                                            <TableHead className="text-right">RTO Count</TableHead>
                                            <TableHead className="text-right">RTO Rate</TableHead>
                                            <TableHead>Performance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courierStats.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No courier data available
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            courierStats.map((courier, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{courier.name}</TableCell>
                                                    <TableCell className="text-right">{courier.totalOrders}</TableCell>
                                                    <TableCell className="text-right">{courier.rtoCount}</TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {courier.rtoPercentage.toFixed(1)}%
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`border ${getRTOBadgeColor(courier.rtoPercentage)} `}>
                                                            {courier.rtoPercentage < 5 ? 'Excellent' :
                                                                courier.rtoPercentage < 15 ? 'Good' : 'Needs Attention'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
