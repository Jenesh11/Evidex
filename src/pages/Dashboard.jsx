import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Users, Scale, BarChart3, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        pendingOrders: 0,
        todayOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const products = await window.electronAPI.products.getAll();
            const lowStock = await window.electronAPI.products.getLowStock();
            const orders = await window.electronAPI.orders.getAll();
            const pendingOrders = orders.filter(o => ['NEW', 'PACKING', 'PACKED'].includes(o.status));

            const today = new Date().toISOString().split('T')[0];
            const todayOrders = orders.filter(o => o.created_at.startsWith(today));

            setStats({
                totalProducts: products.length,
                lowStock: lowStock.length,
                pendingOrders: pendingOrders.length,
                todayOrders: todayOrders.length,
            });

            setRecentOrders(orders.slice(0, 5));
            setLowStockProducts(lowStock.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    };

    // Quick Actions handlers
    const handleRecordPacking = () => {
        navigate('/packing-camera');
    };

    const handleAddProduct = () => {
        navigate('/inventory', { state: { openAddModal: true } });
    };

    const handleNewOrder = () => {
        navigate('/orders', { state: { openCreateModal: true } });
    };

    const handleAddStaff = () => {
        navigate('/staff', { state: { openAddModal: true } });
    };

    const handleReconciliation = () => {
        navigate('/inventory/reconciliation');
    };

    const handleAnalytics = () => {
        navigate('/analytics');
    };

    const handleActivityLogs = () => {
        navigate('/activity-logs');
    };

    const statCards = [
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: Package,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: ShoppingCart,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Low Stock Alerts',
            value: stats.lowStock,
            icon: AlertTriangle,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            title: "Today's Orders",
            value: stats.todayOrders,
            icon: TrendingUp,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your warehouse operations</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="card-hover">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                                    </div>
                                    <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                        <stat.icon className={`w-7 h-7 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Latest order activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
                            ) : (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                        <div className="flex-1">
                                            <p className="font-medium">{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                                        </div>
                                        <div className="text-right mr-4">
                                            <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                                            <p className="text-xs text-muted-foreground">{formatRelativeTime(order.created_at)}</p>
                                        </div>
                                        <Badge className={getStatusColor(order.status)}>
                                            {getStatusLabel(order.status)}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                        <CardDescription>Products running low</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lowStockProducts.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">All products well stocked</p>
                            ) : (
                                lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 hover:bg-orange-500/10 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-orange-500">{product.quantity}</p>
                                            <p className="text-xs text-muted-foreground">in stock</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <button
                            onClick={handleAddProduct}
                            className="p-6 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <Package className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold mb-1">Add Product</h4>
                            <p className="text-sm text-muted-foreground">Create new product</p>
                        </button>
                        <button
                            onClick={handleNewOrder}
                            className="p-6 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <ShoppingCart className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold mb-1">New Order</h4>
                            <p className="text-sm text-muted-foreground">Create new order</p>
                        </button>
                        <button
                            onClick={handleAddStaff}
                            className="p-6 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <Users className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold mb-1">Add Staff</h4>
                            <p className="text-sm text-muted-foreground">Create staff member</p>
                        </button>
                        <button
                            onClick={handleReconciliation}
                            className="p-6 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <Scale className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold mb-1">Reconciliation</h4>
                            <p className="text-sm text-muted-foreground">Adjust inventory</p>
                        </button>
                        <button
                            onClick={handleAnalytics}
                            className="p-6 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <BarChart3 className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold mb-1">Analytics</h4>
                            <p className="text-sm text-muted-foreground">View RTO data</p>
                        </button>
                        <button
                            onClick={handleActivityLogs}
                            className="p-6 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <FileText className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold mb-1">Activity Logs</h4>
                            <p className="text-sm text-muted-foreground">View audit trail</p>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
