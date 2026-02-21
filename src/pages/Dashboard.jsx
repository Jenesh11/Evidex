import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Package, ShoppingCart, AlertTriangle, TrendingUp,
    Users, Scale, BarChart3, FileText, ArrowRight,
    Search, Plus, Hash, User, Calendar, CreditCard, Clock, CheckCircle2,
    ArrowUpRight, Boxes, Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
    const navigate = useNavigate();
    const { isTrialExpired } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        pendingOrders: 0,
        todayOrders: 0,
        revenue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    const handleLockedAction = (action) => {
        if (isTrialExpired) {
            navigate('/pricing');
            return true;
        }
        return false;
    };

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
            const todayRevenue = todayOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);

            setStats({
                totalProducts: products.length,
                lowStock: lowStock.length,
                pendingOrders: pendingOrders.length,
                todayOrders: todayOrders.length,
                revenue: todayRevenue
            });

            setRecentOrders(orders.slice(0, 5));
            setLowStockProducts(lowStock.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    };

    // Quick Actions handlers
    const handleAddProduct = () => !handleLockedAction() && navigate('/inventory', { state: { openAddModal: true } });
    const handleNewOrder = () => !handleLockedAction() && navigate('/orders', { state: { openCreateModal: true } });
    const handleAddStaff = () => !handleLockedAction() && navigate('/staff', { state: { openAddModal: true } });
    const handleReconciliation = () => !handleLockedAction() && navigate('/inventory/reconciliation');
    const handleAnalytics = () => !handleLockedAction() && navigate('/analytics');
    const handleActivityLogs = () => !handleLockedAction() && navigate('/activity-logs');

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.revenue),
            subtitle: "Today's Earnings",
            icon: CreditCard,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20'
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            subtitle: 'Require Attention',
            icon: ShoppingCart,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20'
        },
        {
            title: 'Low Stock Alerts',
            value: stats.lowStock,
            subtitle: 'Products running low',
            icon: AlertTriangle,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20'
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            subtitle: 'In Inventory',
            icon: Boxes,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
    ];

    const quickActions = [
        { title: 'New Order', icon: Plus, action: handleNewOrder, desc: 'Create manual order', color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Add Product', icon: Package, action: handleAddProduct, desc: 'Update inventory', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Add Staff', icon: Users, action: handleAddStaff, desc: 'Manage team', color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { title: 'Reconcile', icon: Scale, action: handleReconciliation, desc: 'Adjust stock', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        { title: 'Analytics', icon: BarChart3, action: handleAnalytics, desc: 'View reports', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { title: 'Audit Logs', icon: FileText, action: handleActivityLogs, desc: 'Track history', color: 'text-gray-500', bg: 'bg-gray-500/10' },
    ];

    return (
        <div className="space-y-8 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Dashboard</h1>
                    <p className="text-muted-foreground text-lg">Overview of your warehouse operations</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleNewOrder}
                        size="lg"
                        className={cn("shadow-lg shadow-primary/20", isTrialExpired && "opacity-60")}
                    >
                        <Plus className="w-5 h-5 mr-2" /> New Order
                        {isTrialExpired && <Lock className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="h-full"
                    >
                        <Card className={`h-full border ${stat.borderColor} bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group`}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                                        <h3 className="text-3xl font-bold tracking-tight mb-1">{stat.value}</h3>
                                        <p className={`text-xs ${stat.color} font-medium flex items-center gap-1`}>
                                            <TrendingUp className="w-3 h-3" /> {stat.subtitle}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} ring-1 ring-inset ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders - Takes up 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-sm overflow-hidden h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle className="text-xl">Recent Orders</CardTitle>
                                <CardDescription>Latest transaction activity</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => !handleLockedAction() && navigate('/orders')}
                                className={cn("group", isTrialExpired && "opacity-60")}
                            >
                                View All {isTrialExpired ? <Lock className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </CardHeader>
                        <Separator />
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px]">
                                {recentOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center">
                                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">No orders yet</p>
                                        <Button variant="link" onClick={handleNewOrder} className="mt-2">Create your first order</Button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {recentOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className={cn(
                                                    "flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group",
                                                    isTrialExpired && "opacity-75"
                                                )}
                                                onClick={() => !handleLockedAction() && navigate('/orders')}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['DELIVERED'].includes(order.status) ? 'bg-green-500/10 text-green-500' :
                                                        ['CANCELLED', 'RTO'].includes(order.status) ? 'bg-red-500/10 text-red-500' :
                                                            'bg-primary/10 text-primary'
                                                        }`}>
                                                        <Hash className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono font-medium text-sm group-hover:text-primary transition-colors">{order.order_number}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {order.customer_name}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRelativeTime(order.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-semibold text-sm">{formatCurrency(order.total_amount)}</p>
                                                    <Badge variant="secondary" className={`mt-1 text-[10px] ${getStatusColor(order.status)}`}>
                                                        {getStatusLabel(order.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Quick Actions & Low Stock */}
                <div className="space-y-6">
                    {/* Quick Actions Tile Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, i) => (
                            <motion.button
                                key={action.title}
                                whileHover={isTrialExpired ? {} : { scale: 1.02 }}
                                whileTap={isTrialExpired ? {} : { scale: 0.98 }}
                                onClick={action.action}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-xl border bg-card transition-all group text-center h-32 shadow-sm relative",
                                    isTrialExpired
                                        ? "opacity-60 cursor-not-allowed border-dashed"
                                        : "hover:border-primary/50 hover:bg-primary/5 shadow-sm"
                                )}
                            >
                                <div className={`w-10 h-10 rounded-full ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-semibold flex items-center gap-1">
                                    {action.title}
                                    {isTrialExpired && <Lock className="w-3.5 h-3.5" />}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">{action.desc}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Low Stock Widget */}
                    <Card className="border-orange-500/20 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 border-b border-orange-500/10 bg-orange-500/5">
                            <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="w-5 h-5" /> Low Stock Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {lowStockProducts.length === 0 ? (
                                <div className="p-8 text-center bg-orange-500/5">
                                    <CheckCircle2 className="w-8 h-8 text-orange-500 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-medium text-orange-600/80">All items well stocked</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {lowStockProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className={cn(
                                                "flex items-center justify-between p-4 hover:bg-orange-500/5 transition-colors group cursor-pointer",
                                                isTrialExpired && "opacity-75"
                                            )}
                                            onClick={() => !handleLockedAction() && navigate('/inventory')}
                                        >
                                            <div>
                                                <p className="font-medium text-sm text-foreground group-hover:text-orange-600 transition-colors">{product.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono mt-0.5">{product.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-orange-600">{product.quantity}</span>
                                                <p className="text-[10px] uppercase font-bold text-orange-600/60">Units Left</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
