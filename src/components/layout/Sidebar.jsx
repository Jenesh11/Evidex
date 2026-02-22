import React from 'react';
import Logo from '@/components/ui/Logo';

import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Video, RotateCcw, Users, Settings as SettingsIcon, Scale, FileText, BarChart3, Crown, Lock, Shield, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

import { PLANS, hasFeature } from '@/config/plans';


const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', permission: null },
    { to: '/inventory', icon: Package, label: 'Inventory', permission: null },
    { to: '/orders', icon: ShoppingCart, label: 'Orders', permission: null }, // Changed: Staff can view orders
    { to: '/packing', icon: Video, label: 'Packing Camera', permission: null, requiredFeature: 'packing_camera' }, // Changed: Staff can use packing camera
    { to: '/returns', icon: RotateCcw, label: 'Returns & RTO', permission: null },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', permission: 'view_analytics', requiredFeature: 'analytics' },
    { to: '/staff', icon: Users, label: 'Staff', permission: 'manage_staff', requiredFeature: 'multi_staff' },
    // Admin only items
    { to: '/inventory/reconciliation', icon: Scale, label: 'Reconciliation', permission: 'manage_inventory', requiredFeature: 'inventory_reconciliation' },
    { to: '/activity-logs', icon: FileText, label: 'Activity Logs', permission: 'view_logs' },
    { to: '/pricing', icon: Crown, label: 'Pricing', permission: null, adminOnly: true }, // Changed: Admin only
    { to: '/settings', icon: SettingsIcon, label: 'Settings', permission: null }, // Changed: Everyone can access settings
];


export default function Sidebar() {
    const {
        hasPermission,
        effectivePlan,
        profile,
        user,
        isTrialExpired,
        trialDaysRemaining,
        isLifetime,
        planExpiresAt
    } = useAuth();
    const navigate = useNavigate();

    // Check if user is staff (not admin)
    // Staff members have a role property, admins authenticate via Supabase and don't have role or have role 'ADMIN'
    const isStaff = profile?.role && profile.role !== 'ADMIN' && profile.role !== 'admin';

    const isItemLocked = (item) => {
        // 1. Check Plan Lock
        if (item.requiredFeature && !hasFeature(effectivePlan, item.requiredFeature)) {
            return { locked: true, reason: 'Upgrade to Pro to unlock this feature' };
        }

        // 2. Check Trial Expiry Lock
        // Allowed items: Dashboard ('/'), Pricing ('/pricing'), Settings ('/settings')
        const allowedPaths = ['/', '/pricing', '/settings'];
        if (isTrialExpired && !allowedPaths.includes(item.to)) {
            return { locked: true, reason: 'Trial expired - Upgrade to continue' };
        }

        return { locked: false };
    };

    const handleLockedClick = (e, lockInfo) => {
        e.preventDefault();
        navigate('/pricing');
    };

    return (
        <aside className="w-64 bg-card border-r border-border/50 flex flex-col h-full">
            <div className="p-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                    <Logo className="w-12 h-12" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Evidex</h1>
                        <p className="text-sm text-muted-foreground font-medium">Protection System</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    // 1. Hide admin-only items from staff
                    if (item.adminOnly && isStaff) {
                        return null;
                    }

                    // 2. Permission Check (Hides item completely if NO permission)
                    if (item.permission && !hasPermission(item.permission)) {
                        return null;
                    }

                    const lockInfo = isItemLocked(item);
                    const planLocked = lockInfo.locked;
                    const Icon = item.icon;

                    return (
                        <div key={item.to} className="relative group">
                            <NavLink
                                to={planLocked ? '#' : item.to}
                                onClick={(e) => planLocked && handleLockedClick(e, lockInfo)}
                                end={item.to === '/' || item.to === '/inventory'}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center h-12 px-4 rounded-lg transition-all duration-200',
                                        isActive && !planLocked
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                        planLocked && 'opacity-60 cursor-not-allowed'
                                    )
                                }
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="ml-3 font-medium truncate">{item.label}</span>
                                {planLocked && <Lock className="w-4 h-4 flex-shrink-0 ml-auto text-muted-foreground" />}
                            </NavLink>

                            {/* CSS Tooltip - only shows on hover */}
                            {planLocked && (
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                                    {lockInfo.reason}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-border/30 pt-4">
                {/* Dynamic Status Display */}
                {isLifetime ? (
                    <div className="px-4 mb-4">
                        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                            <div className="flex items-center gap-2 text-amber-500">
                                <Crown className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">Lifetime License</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mt-1">Full Access Guaranteed</p>
                        </div>
                    </div>
                ) : planExpiresAt && !isTrialExpired ? (
                    <div className="px-4 mb-4">
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                            <div className="flex items-center gap-2 text-primary">
                                <Shield className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{effectivePlan} Plan</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mt-1 italic">
                                Expires: {new Date(planExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                ) : trialDaysRemaining > 0 ? (
                    <div className="p-4 pt-0 space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> Trial Period
                            </span>
                            <span className="text-foreground">{trialDaysRemaining} days left</span>
                        </div>
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                style={{ width: `${Math.min(100, (trialDaysRemaining / 7) * 100)}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="px-4 mb-4">
                        <div className="p-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-center">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-500">Trial Expired</span>
                        </div>
                    </div>
                )}

                <div className="px-4 pb-4 text-[10px] text-muted-foreground/60 text-center font-medium">
                    v1.0.24 • Local Storage
                </div>
            </div>
        </aside>
    );
}
