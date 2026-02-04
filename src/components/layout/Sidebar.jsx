import React from 'react';
import logo from '@/assets/logo.png';

import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Video, RotateCcw, Users, Settings as SettingsIcon, Scale, FileText, BarChart3, Crown, Lock } from 'lucide-react';
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
    const { hasPermission, effectivePlan, profile, user } = useAuth();
    const navigate = useNavigate();

    // Check if user is staff (not admin)
    // Staff members have a role property, admins authenticate via Supabase and don't have role or have role 'ADMIN'
    const isStaff = profile?.role && profile.role !== 'ADMIN' && profile.role !== 'admin';

    console.log('[Sidebar] Profile:', profile);
    console.log('[Sidebar] isStaff:', isStaff);

    const isFeatureLocked = (requiredFeature) => {
        if (!requiredFeature) return false;
        return !hasFeature(effectivePlan, requiredFeature);
    };

    const handleLockedClick = (e) => {
        e.preventDefault();
        navigate('/pricing');
    };

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-20 h-20 flex items-center justify-center overflow-hidden rounded-lg">
                        <img src={logo} alt="Evidex Logo" className="w-32 h-32 max-w-none object-contain" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Evidex</h1>
                        <p className="text-sm text-muted-foreground font-medium">Protection System</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    // 1. Hide admin-only items from staff
                    if (item.adminOnly && isStaff) {
                        return null;
                    }

                    // 2. Permission Check (Hides item completely if NO permission)
                    if (item.permission && !hasPermission(item.permission)) {
                        return null;
                    }

                    const planLocked = isFeatureLocked(item.requiredFeature);
                    const Icon = item.icon;

                    return (
                        <div key={item.to} className="relative group">
                            <NavLink
                                to={planLocked ? '#' : item.to}
                                onClick={(e) => planLocked && handleLockedClick(e, item)}
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
                                    Upgrade to Pro to unlock this feature
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
                <div className="text-xs text-muted-foreground text-center">
                    v1.0.0 • Local Storage
                </div>
            </div>
        </aside>
    );
}
