import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingDown, TrendingUp, Package, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { hasFeature, PLANS } from '@/config/plans';
import { UpgradePrompt } from '@/components/UpgradePrompt';

import { useAuth } from '@/contexts/AuthContext';

// Simple Bar Chart Component
const SimpleBarChart = ({ data, maxValue }) => (
    <div className="space-y-2">
        {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
                <span className="w-32 text-sm truncate font-medium">{item.label}</span>
                <div className="flex-1 bg-secondary rounded-full h-8 overflow-hidden">
                    <div
                        className="bg-primary h-full flex items-center justify-end px-3 transition-all duration-500"
                        style={{ width: `${(item.value / maxValue) * 100}%` }}
                    >
                        {item.value > 0 && (
                            <span className="text-xs font-semibold text-primary-foreground">
                                {item.value.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>
                <span className="w-16 text-sm text-muted-foreground text-right">{item.count}</span>
            </div>
        ))}
    </div>
);

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, trend }) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
            </div>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
                <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
            )}
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
            .slice(0, 10); // Top 10 products
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
        if (percentage < 5) return 'bg-green-500/10 text-green-700 border-green-500/20';
        if (percentage < 15) return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
        return 'bg-red-500/10 text-red-700 border-red-500/20';
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">RTO & Return Analytics</h1>
                <p className="text-muted-foreground">Analyze return patterns and identify problem areas</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Orders"
                    value={metrics.totalOrders}
                    icon={Package}
                    subtitle="All orders in system"
                />
                <MetricCard
                    title="Total Returns"
                    value={metrics.totalReturns}
                    icon={RotateCcw}
                    subtitle={`${metrics.returnRate.toFixed(1)}% return rate`}
                />
                <MetricCard
                    title="RTO Count"
                    value={metrics.rtoCount}
                    icon={TrendingDown}
                    subtitle="Return to origin"
                />
                <MetricCard
                    title="Return Rate"
                    value={`${metrics.returnRate.toFixed(1)}%`}
                    icon={BarChart3}
                    subtitle={`${metrics.totalReturns} of ${metrics.totalOrders}`}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RTO % by Product */}
                <Card>
                    <CardHeader>
                        <CardTitle>RTO % by Product</CardTitle>
                        <CardDescription>Top 10 products with highest RTO rates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {productRTOData.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No product data available</p>
                        ) : (
                            <SimpleBarChart data={productRTOData.map(p => ({
                                label: p.name,
                                value: p.rtoPercentage,
                                count: `${p.rtoCount}/${p.totalOrders}`
                            }))} maxValue={maxRTOPercentage} />
                        )}
                    </CardContent>
                </Card>

                {/* Return Reason Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Return Reason Breakdown</CardTitle>
                        <CardDescription>Why customers are returning orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reasonBreakdown.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No return data available</p>
                        ) : (
                            <SimpleBarChart data={reasonBreakdown} maxValue={maxReasonPercentage} />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Product RTO Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Product RTO Details</CardTitle>
                    <CardDescription>Detailed breakdown of RTO by product</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead className="text-right">Total Orders</TableHead>
                                    <TableHead className="text-right">RTO Count</TableHead>
                                    <TableHead className="text-right">RTO %</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productRTOData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No product data available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    productRTOData.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="text-right">{product.totalOrders}</TableCell>
                                            <TableCell className="text-right">{product.rtoCount}</TableCell>
                                            <TableCell className="text-right font-mono font-semibold">
                                                {product.rtoPercentage.toFixed(1)}%
                                            </TableCell>
                                            <TableCell>
                                                {product.rtoPercentage > 20 ? (
                                                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                                                        High Risk
                                                    </Badge>
                                                ) : product.rtoPercentage > 10 ? (
                                                    <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                                                        Medium Risk
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                                        Low Risk
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
                        <CardTitle>Courier Performance Analysis</CardTitle>
                        <CardDescription>RTO rates by courier partner</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Courier Name</TableHead>
                                        <TableHead className="text-right">Total Orders</TableHead>
                                        <TableHead className="text-right">RTO Count</TableHead>
                                        <TableHead className="text-right">RTO %</TableHead>
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
                                                <TableCell className="text-right font-mono font-semibold">
                                                    {courier.rtoPercentage.toFixed(1)}%
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`border ${getRTOBadgeColor(courier.rtoPercentage)}`}>
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
    );
}
